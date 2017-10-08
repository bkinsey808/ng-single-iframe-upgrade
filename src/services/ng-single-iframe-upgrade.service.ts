import { Injectable, Inject, ElementRef } from '@angular/core'
import { Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

// below is just temporary, see https://github.com/ReactiveX/rxjs/blob/master/doc/lettable-operators.md
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/distinctUntilChanged'

@Injectable()
export class NgSingleIframeUpgradeService {
  private static displayLegacyBase: string
  private static actualLegacyBase: string
  private static forceUpgradeUrls: string

  // consider moving these behavior subjects into rxjs/store
  showIframe$: BehaviorSubject<boolean> = new BehaviorSubject(false)
  angularUrl$: BehaviorSubject<string> = new BehaviorSubject('/')
  angularJsDisplayUrl$: BehaviorSubject<string> = new BehaviorSubject(
    `/${NgSingleIframeUpgradeService.displayLegacyBase}`
  )

  // read only, derivative from angularJsDisplayUrl$
  angularJsActualUrl$: Observable<string>

  showModalBackdrop$: BehaviorSubject<boolean> = new BehaviorSubject(false)

  iframeElementRef: ElementRef

  private static setDisplayLegacyBase(base: string) {
    this.displayLegacyBase = base
  }
  private static getDisplayLegacyBase() {
    return this.displayLegacyBase
  }

  private static setActualLegacyBase(base: string) {
    this.actualLegacyBase = base
  }
  private static getActualLegacyBase() {
    return this.actualLegacyBase
  }

  constructor(@Inject(Router) private router: Router) {
    this.angularJsActualUrl$ = this.angularJsDisplayUrl$
      .asObservable()
      .map(url => this.getAngularJsActualUrl(url))
      .distinctUntilChanged()

    // why is HostListener not available in a serice? Boo. :(
    // https://stackoverflow.com/questions/39592972/is-it-possible-to-use-hostlistener-in-a-service
    window.addEventListener('message', this.onMessage.bind(this), false)
  }

  setAngularUrl(url: string) {
    this.angularUrl$.next(url)
  }

  setIframeElementRef(elementRef: ElementRef) {
    this.iframeElementRef = elementRef
  }

  switchToAngularJsMode(url: string) {
    this.showIframe$.next(true)
    url && this.differentUrl(url)
      ? this.iframeChangeUrl(url)
      : this.updateDisplayUrl()
  }

  switchToAngularMode(url: string | null) {
    if (url) {
      this.router.navigateByUrl(url)
    }
    this.showIframe$.next(false)
    this.updateDisplayUrl()
  }

  setAngularJsUrl(url: string) {
    url = this.getAngularJsDisplayUrl(url)
    this.angularJsDisplayUrl$.next(url)
  }

  getAngularJsDisplayUrl(url: string) {
    if (!url || url === '/') {
      return `/${NgSingleIframeUpgradeService.displayLegacyBase}`
    }
    return url.replace(
      new RegExp(`^/${NgSingleIframeUpgradeService.actualLegacyBase}`),
      `/${NgSingleIframeUpgradeService.displayLegacyBase}`
    )
  }

  private differentUrl(url: string) {
    return (
      this.angularJsDisplayUrl$.value !==
      `/${NgSingleIframeUpgradeService.displayLegacyBase}` + url
    )
  }

  private iframeChangeUrl(url: string) {
    this.iframeElementRef.nativeElement.contentWindow.postMessage(
      {
        changeUrl: `/${NgSingleIframeUpgradeService.actualLegacyBase}` + url
      },
      '*'
    )
  }

  private getAngularJsActualUrl(url: string) {
    url = url.replace(
      new RegExp(`^/${NgSingleIframeUpgradeService.displayLegacyBase}`),
      `/${NgSingleIframeUpgradeService.actualLegacyBase}`
    )
    if (url === `/${NgSingleIframeUpgradeService.actualLegacyBase}`) {
      url += '/'
    }
    return url
  }

  private updateDisplayUrl() {
    const url = this.showIframe$.value
      ? this.angularJsDisplayUrl$.value
      : this.angularUrl$.value
    if (window) {
      window.history.pushState(null, '', url)
    }
  }

  // tslint:disable-next-line
  private onMessage(event: any) {
    // tslint:disable-next-line
    const handleMessageWhitelist: any = {
      modalClose: 'handleModalOpenOrClose',
      modalOpen: 'handleModalOpenOrClose',
      urlChange: 'handleUrlChange'
    }
    // tslint:disable-next-line
    const handleMethodName: any = handleMessageWhitelist[event.data.type]
    if (handleMethodName) {
      // tslint:disable-next-line
      ;(<any>this)[handleMethodName].bind(this)(event.data.data)
    }
  }

  // tslint:disable-next-line
  private handleUrlChange(data: any) {
    // At first I was concerned URL would not be available for IE 11, but
    // maybe core-js handles this? Seems to be working...
    const url = new URL(data.url)
    const pathname = url.pathname
    const displayUrl = this.getAngularJsDisplayUrl(pathname)
    this.angularJsDisplayUrl$.next(displayUrl)
    this.updateDisplayUrl()
  }

  // tslint:disable-next-line
  private handleModalOpenOrClose(data: any) {
    this.showModalBackdrop$.next(data.numOpenModals > 0)
  }
}
