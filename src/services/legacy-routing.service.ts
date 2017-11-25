import { Injectable, ElementRef, OnDestroy, Inject } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subscription } from 'rxjs/Subscription'
import {
  distinctUntilChanged,
  filter,
  map,
  tap,
  startWith
} from 'rxjs/operators'

import { IframeMessagesService } from './iframe-messages.service'

export interface LegacyRoutingConfig {
  actualLegacyBase: string
  displayLegacyBase: string
  legacyStartPath?: string
}

/**
 * handles routing related to the iframe
 */
@Injectable()
export class LegacyRoutingService implements OnDestroy {
  constructor(
    private iframeMessages: IframeMessagesService,
    private router: Router,
    @Inject('config') private config: LegacyRoutingConfig
  ) {
    const initialIsLegacyMode = this.isLegacyUrl(window.location.pathname)
    if (initialIsLegacyMode) {
      this.currentLegacyUrl = window.location.pathname
    }
    this.initObservables(initialIsLegacyMode)
    this.initSubscriptions()
  }

  // public instance properties (should these be moved to Store?)

  /** fires every time legacy mode changes */
  legacyMode$: Observable<boolean>
  /** the raw urls coming from the router */
  routerUrl$: Observable<string>
  /** the subset of router urls that are modern */
  modernUrl$: Observable<string>
  /** the subset of router urls that are legacy */
  legacyUrl$: Observable<string>

  // private instance properties (should these be moved to Store?)

  /** the iframe element, needed to get iframe route */
  private iframeElementRef: ElementRef
  /** the raw (input) legacy mode */
  private inputLegacyMode$: BehaviorSubject<boolean>
  private currentModernUrl: string
  private currentLegacyUrl: string
  /** flag when going from modern route to legacy route */
  private fromModernToLegacy = false
  /** used for determining how to set fromModernToLegacy flag */
  private previousRouterUrl: string
  /** keep track of subscriptions so we can unsubscribe */
  private subscriptions: Subscription[]

  // public methods

  /** show the iframe */
  setLegacyMode() {
    this.inputLegacyMode$.next(true)
  }
  /** hide the iframe */
  setModernMode() {
    this.inputLegacyMode$.next(false)
  }
  /** is iframe showing? */
  isLegacyMode() {
    return this.inputLegacyMode$.value
  }
  /** needed to be able to get current iframe route */
  setIframeElementRef(elementRef: ElementRef) {
    this.iframeElementRef = elementRef
  }

  getCurrentLegacyUrl() {
    // in the case of a router redirectTo, the currentLegacyUrl can get out of sync
    if (this.isLegacyUrl(window.location.pathname)) {
      this.currentLegacyUrl = this.getActualUrl(window.location.pathname)
    }
    return this.currentLegacyUrl
  }

  isLegacyUrl(url: string) {
    if (!url) {
      return false
    }
    const displayRegexp = new RegExp(`^/${this.getDisplayLegacyBase()}`)
    if (url.search(displayRegexp) !== -1) {
      return true
    }
    const actualRegexp = new RegExp(`^/${this.getActualLegacyBase()}`)
    return url.search(actualRegexp) !== -1
  }

  // private methods

  private initObservables(initialIsLegacyMode: boolean) {
    this.inputLegacyMode$ = this.getInputLegacyMode$(initialIsLegacyMode)
    this.legacyMode$ = this.getLegacyMode$(initialIsLegacyMode)
    this.routerUrl$ = this.getRouterUrl$()
    this.legacyUrl$ = this.getLegacyUrl$()
    this.modernUrl$ = this.getModernUrl$()
  }

  private initSubscriptions() {
    this.subscriptions = [
      // the binding is necessary, unfortunately.
      this.legacyMode$.subscribe(this.legacyMode$next.bind(this)),
      this.routerUrl$.subscribe(this.routerUrl$next.bind(this)),
      this.modernUrl$.subscribe(this.modernUrl$next.bind(this)),
      this.legacyUrl$.subscribe(this.legacyUrl$next.bind(this)),
      this.iframeMessages.iframeUrlBlocked$.subscribe(
        this.iframeUrlBlocked$next.bind(this)
      ),
      this.iframeMessages.iframeUrlSuccess$.subscribe(
        this.iframeUrlSuccess$next.bind(this)
      ),
      this.iframeMessages.iframeTitle$.subscribe(
        title => (document.title = title)
      )
    ]
  }

  private getLegacyMode$(initialIsLegacyMode: boolean) {
    return this.inputLegacyMode$.pipe(
      distinctUntilChanged(),
      startWith(initialIsLegacyMode)
    )
  }

  private getInputLegacyMode$(initialIsLegacyMode: boolean) {
    return new BehaviorSubject(initialIsLegacyMode)
  }

  private getLegacyUrl$(): Observable<string> {
    return this.routerUrl$.pipe(
      filter(url => this.isLegacyUrl(url)),
      map(url => this.getActualUrl(url)),
      filter(url => url !== this.getIframePathname()),
      distinctUntilChanged(),
      startWith(this.getStartWithLegacyUrl())
    )
  }

  private getIframePathname() {
    if (!this.iframeElementRef) {
      return
    }
    const contentWindow = this.iframeElementRef.nativeElement.contentWindow
    if (!contentWindow) {
      return
    }
    return contentWindow.location.pathname
  }

  private getStartWithLegacyUrl() {
    const displayUrl = window.location.pathname
    if (this.isLegacyUrl(displayUrl)) {
      return this.getActualUrl(displayUrl)
    }
    return (
      `/${this.getActualLegacyBase()}` +
      (this.config.legacyStartPath ? `/${this.config.legacyStartPath}` : '')
    )
  }

  private getModernUrl$(): Observable<string> {
    return this.routerUrl$.pipe(
      filter(url => !this.isLegacyUrl(url)),
      tap(() => this.setModernMode()),
      distinctUntilChanged()
    )
  }

  private getRouterUrl$() {
    return this.router.events.pipe(
      filter(e => e instanceof NavigationEnd), // every route change fires multiple events - only care about the route change as a whole
      map(() => this.router.url),
      distinctUntilChanged(),
      startWith(this.router.url)
    )
  }

  private legacyMode$next(isLegacyMode: boolean) {
    const url = isLegacyMode
      ? this.getDisplayUrl(this.getCurrentLegacyUrl())
      : this.currentModernUrl
    if (url) {
      this.router.navigateByUrl(url)
    }
  }

  // tslint:disable-next-line
  private routerUrl$next(url: string) {
    this.fromModernToLegacy =
      this.previousRouterUrl !== '/' &&
      !this.isLegacyUrl(this.previousRouterUrl) &&
      this.isLegacyUrl(url)
    this.previousRouterUrl = url
    if (this.currentLegacyUrl === this.getActualUrl(url)) {
      this.setLegacyMode()
    }
    if (this.isLegacyUrl(url) && !this.fromModernToLegacy) {
      this.setLegacyMode()
    }
  }

  private modernUrl$next(url: string) {
    this.currentModernUrl = url
    // always want to change to modern mode
    this.setModernMode()
  }

  private legacyUrl$next(url: string) {
    this.currentLegacyUrl = url
    // postmessage to the iframe with the legacy route
    this.iframeMessages.postMessage({ changeUrl: url })
  }

  private iframeUrlBlocked$next(url: string) {
    console.log(url)
    const displayUrl = this.getDisplayUrl(url)
    if (this.shouldNavToBlockedUrl(displayUrl)) {
      this.router.navigateByUrl(displayUrl)
    }
    this.fromModernToLegacy = false
  }

  /**
   * we only care about the case when we are switching from modern to legacy.
   * the fact that the url change was successful in the iframe means that
   * we can now finally switch to legacy mode after initially delaying
   */
  private iframeUrlSuccess$next(url: string) {
    if (!this.isLegacyMode() && this.fromModernToLegacy) {
      this.setLegacyMode()
    }
  }

  /** blocked urls come from the iframe. can we nav to them? */
  private shouldNavToBlockedUrl(displayUrl: string) {
    /** obviously don't nav if we are already there */
    if (displayUrl === this.getCurrentRouterUrl()) {
      return false
    }
    /** always safe to navigate if in legacy mode */
    if (this.isLegacyMode) {
      return true
    }
    /**
     * in modern mode, only safe if navigating from from modern to legacy
     * otherwise it might be a background url change in the iframe,
     * and we don't care about that
     */
    return this.fromModernToLegacy
  }

  private getCurrentRouterUrl() {
    return this.router.url
  }

  /** the url shown in the browser */
  private getDisplayUrl(url: string) {
    return url.replace(
      new RegExp(`^/${this.getActualLegacyBase()}`),
      `/${this.getDisplayLegacyBase()}`
    )
  }

  /** the url internal to the iframe, the legacy url */
  private getActualUrl(url: string) {
    url = url.replace(
      new RegExp(`^/${this.getDisplayLegacyBase()}`),
      `/${this.getActualLegacyBase()}`
    )
    if (url === `/${this.getActualLegacyBase()}`) {
      url += '/'
    }
    return url
  }

  /** base url path we show on browser for legacy urls e.g. home/legacy */
  private getDisplayLegacyBase() {
    return this.config.displayLegacyBase
  }

  /** base url path internal to iframe e.g. ng1 */
  private getActualLegacyBase() {
    return this.config.actualLegacyBase
  }

  /**
   * does ngOnDestroy get called for services? I am unclear
   * https://stackoverflow.com/questions/45898948/angular-4-ngondestroy-in-service-destroy-observable
   */
  ngOnDestroy() {
    this.subscriptions.map(subscription => subscription.unsubscribe())
  }
}
