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
  isLegacyMode$: BehaviorSubject<boolean> = new BehaviorSubject(false)
  angularUrl$: BehaviorSubject<string> = new BehaviorSubject('/')
  legacyDisplayUrl$: BehaviorSubject<string> = new BehaviorSubject(
    `/${NgSingleIframeUpgradeService.displayLegacyBase}`
  )

  // read only, derivative from legacyDisplayUrl$
  legacyActualUrl$: Observable<string>

  showModalBackdrop$: BehaviorSubject<boolean> = new BehaviorSubject(false)

  iframeElementRef: ElementRef

  private isLoggedInMethod: Function

  static setDisplayLegacyBase(base: string) {
    this.displayLegacyBase = base
  }
  static getDisplayLegacyBase() {
    return this.displayLegacyBase
  }

  static setActualLegacyBase(base: string) {
    this.actualLegacyBase = base
  }
  static getActualLegacyBase() {
    return this.actualLegacyBase
  }

  constructor(@Inject(Router) private router: Router) {
    this.legacyActualUrl$ = this.legacyDisplayUrl$
      .asObservable()
      .map(url => this.getLegacyActualUrl(url))
      .distinctUntilChanged()

    // why is HostListener not available in a serice? Boo. :(
    // https://stackoverflow.com/questions/39592972/is-it-possible-to-use-hostlistener-in-a-service
    window.addEventListener('message', this.onMessage.bind(this), false)
  }

  setModernUrl(url: string) {
    this.angularUrl$.next(url)
  }

  setIframeElementRef(elementRef: ElementRef) {
    this.iframeElementRef = elementRef
  }

  switchToLegacyMode(url: string) {
    if (!this.isLoggedInMethod()) {
      return
    }
    this.isLegacyMode$.next(true)
    if (url && this.differentUrl(url)) {
      this.iframeChangeUrl(url)
    } else {
      this.updateDisplayUrl()
    }
  }

  switchToModernMode(url?: string) {
    if (url) {
      this.router.navigateByUrl(url)
    }
    this.isLegacyMode$.next(false)
    this.updateDisplayUrl()
  }

  setLegacyUrl(url: string) {
    url = this.getLegacyDisplayUrl(url)
    this.legacyDisplayUrl$.next(url)
  }

  getLegacyDisplayUrl(url: string) {
    if (!url || url === '/') {
      return `/${NgSingleIframeUpgradeService.displayLegacyBase}`
    }
    return url.replace(
      new RegExp(`^/${NgSingleIframeUpgradeService.actualLegacyBase}`),
      `/${NgSingleIframeUpgradeService.displayLegacyBase}`
    )
  }

  navigateByUrl(url: string) {
    if (this.isLegacyUrl(url)) {
      this.switchToLegacyMode(url)
    } else {
      this.switchToModernMode(url)
    }
  }

  isLegacyUrl(url: string) {
    const regexp = new RegExp(
      `^/${NgSingleIframeUpgradeService.displayLegacyBase}`
    )
    return url.search(regexp) !== -1
  }

  setIsLoggedInMethod(method: Function) {
    this.isLoggedInMethod = method
  }

  private differentUrl(url: string) {
    return (
      this.legacyDisplayUrl$.value !==
      `/${NgSingleIframeUpgradeService.displayLegacyBase}` + url
    )
  }

  private iframeChangeUrl(url: string) {
    this.iframeElementRef.nativeElement.contentWindow.postMessage(
      {
        changeUrl: this.getLegacyActualUrl(url)
      },
      '*'
    )
  }

  private getLegacyActualUrl(url: string) {
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
    const url = this.isLegacyMode$.value
      ? this.legacyDisplayUrl$.value
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
    if (!this.isLoggedInMethod()) {
      return
    }
    if (!this.isLegacyMode$.value) {
      return
    }
    const url = new URL(data.url)
    const pathname = url.pathname
    const displayUrl = this.getLegacyDisplayUrl(pathname)
    this.legacyDisplayUrl$.next(displayUrl)
    this.updateDisplayUrl()
  }

  // tslint:disable-next-line
  private handleModalOpenOrClose(data: any) {
    this.showModalBackdrop$.next(data.numOpenModals > 0)
  }
}
