import { Injectable, ElementRef } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'
import { fromEvent } from 'rxjs/observable/fromEvent'
import { from } from 'rxjs/observable/from'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/do'

import { IframeMessagesService } from './iframe-messages.service'

/**
 * handles routing related to the iframe, both getting and setting
 * we want to listen to
 *
 * legacy-originated url changes
 * modern-originated url changes
 * iframe height changes
 * modal changes
 * auth changes (maybe?)
 *
 *
 * we want the iframe component to listen to
 *
 * modern originated url changes
 */
@Injectable()
export class LegacyRoutingService {
  /** the route according the browser */
  private static displayLegacyBase: string
  /** the route according the iframe */
  private static actualLegacyBase: string

  /** fires every time legacy mode changes */
  legacyMode$: Observable<boolean>
  /** the raw urls coming from the router */
  routerUrl$: Observable<string>
  /** the subset of router urls that are modern */
  modernUrl$: Observable<string>
  /** the subset of router urls that are legacy */
  legacyUrl$: Observable<string>

  /** the iframe element */
  private iframeElementRef: ElementRef
  /** the raw (input) legacy mode */
  private inputLegacyMode$: BehaviorSubject<boolean>
  private currentModernUrl: string
  private currentLegacyUrl: string
  /** flag when going from modern route to legacy route */
  private fromModernToLegacy: boolean
  /** used for determining how to set fromModernToLegacy flag */
  private previousRouterUrl: string

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

  setLegacyMode() {
    this.inputLegacyMode$.next(true)
  }
  setModernMode() {
    this.inputLegacyMode$.next(false)
  }
  isLegacyMode() {
    return this.inputLegacyMode$.value
  }
  setIframeElementRef(elementRef: ElementRef) {
    this.iframeElementRef = elementRef
  }
  getIframeElementRef() {
    return this.iframeElementRef
  }

  isLegacyUrl(url: string) {
    if (!url) {
      return false
    }
    const regexp = new RegExp(`^/${LegacyRoutingService.displayLegacyBase}`)
    return url.search(regexp) !== -1
  }

  constructor(
    private iframeMessages: IframeMessagesService,
    private router: Router
  ) {
    this.initObservables()
    this.initSubscriptions()
    this.backButtonHack()
  }

  /**
   * tries to keep iframe and browser url in sync
   * when back and forward buttons clicked
   */
  private backButtonHack() {
    const pops = fromEvent(window, 'popstate').subscribe(event => {
      setTimeout(() => {
        if (this.isLegacyUrl(window.location.pathname)) {
          const actualUrl = this.getActualUrl(window.location.pathname)
          this.iframeMessages.postMessage(actualUrl)
        } else {
          this.router.navigateByUrl(window.location.pathname)
        }
      }, 50)
    })
  }

  private initObservables() {
    this.inputLegacyMode$ = new BehaviorSubject(false)
    this.legacyMode$ = from(this.inputLegacyMode$)
      .distinctUntilChanged()
      .startWith(false)

    this.routerUrl$ = this.getRouterUrl$()
    this.legacyUrl$ = this.getLegacyUrl$()
    this.modernUrl$ = this.getModernUrl$()
  }

  private getLegacyUrl$(): Observable<string> {
    return this.routerUrl$
      .filter(url => this.isLegacyUrl(url))
      .map(url => this.getActualUrl(url))
      .do(url => {
        const displayUrl = this.getDisplayUrl(url)
        if (this.isLegacyMode() || this.fromModernToLegacy) {
          this.fromModernToLegacy = false
          this.inputLegacyMode$.next(true)
        }

        this.inputLegacyMode$.next(true)
      })
      .filter(
        url =>
          url !==
          this.iframeElementRef.nativeElement.contentWindow.location.pathname
      )
      .distinctUntilChanged()
  }

  private getModernUrl$(): Observable<string> {
    return this.routerUrl$
      .filter(url => !this.isLegacyUrl(url))
      .do(() => this.inputLegacyMode$.next(false))
      .distinctUntilChanged()
  }

  private getRouterUrl$() {
    return this.router.events
      .filter(e => e instanceof NavigationEnd) // every route change fires multiple events - only care about the route change as a whole
      .map(() => this.router.url)
      .distinctUntilChanged()
      .startWith(this.router.url)
  }

  private initSubscriptions() {
    this.routerUrl$.subscribe(url => {
      this.fromModernToLegacy =
        !this.isLegacyUrl(this.previousRouterUrl) && this.isLegacyUrl(url)
      this.previousRouterUrl = url
    })
    this.modernUrl$.subscribe(url => {
      this.currentModernUrl = url
      // always want to change to modern mode
      this.inputLegacyMode$.next(false)
    })
    this.legacyUrl$.subscribe(url => {
      this.currentLegacyUrl = url
      // postmessage to the iframe with the legacy route
    })
    this.iframeMessages.iframeOriginatedPathnameChange$
      .filter(url => !!url)
      .subscribe(url => {
        const displayUrl = this.getDisplayUrl(url)
        if (this.isLegacyMode() || this.fromModernToLegacy) {
          this.fromModernToLegacy = false
          this.inputLegacyMode$.next(true)
          if (displayUrl !== this.getCurrentRouterUrl()) {
            this.router.navigateByUrl(displayUrl)
          }
        }
      })
  }

  private getDisplayUrl(url: string) {
    return url.replace(
      new RegExp(`^/${LegacyRoutingService.actualLegacyBase}`),
      `/${LegacyRoutingService.displayLegacyBase}`
    )
  }

  private getActualUrl(url: string) {
    url = url.replace(
      new RegExp(`^/${LegacyRoutingService.displayLegacyBase}`),
      `/${LegacyRoutingService.actualLegacyBase}`
    )
    if (url === `/${LegacyRoutingService.actualLegacyBase}`) {
      url += '/'
    }
    return url
  }

  private getCurrentRouterUrl() {
    return this.router.url
  }

  private getCurrentLegacyUrl() {
    return this.currentLegacyUrl
  }

  private getCurrentModernUrl() {
    return this.currentModernUrl
  }
}
