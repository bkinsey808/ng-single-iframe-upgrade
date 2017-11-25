import { Injectable, ElementRef } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { fromEvent } from 'rxjs/observable/fromEvent'
import { map, filter, distinctUntilChanged, tap } from 'rxjs/operators'

interface MessageEvent {
  data: MessageEventData
}

interface MessageEventData {
  type: EventDataType
  data: {
    url?: string
    title?: string
  }
}
type EventDataType =
  | 'modalClose'
  | 'modalOpen'
  | 'urlSuccess'
  | 'urlBlocked'
  | 'changeTitle'

/**
 * handles all messages to and from the iframe
 */
@Injectable()
export class IframeMessagesService {
  /** observable that returns a boolean true if modal is showing in legacy */
  showModal$: Observable<boolean>
  iframeUrlBlocked$: Observable<string>
  iframeUrlSuccess$: Observable<string>
  iframeTitle$: Observable<string>

  /** the iframe element */
  private iframeElementRef: ElementRef
  /** raw (input) observable of messages coming from the iframe */
  private message$: Observable<MessageEvent>

  constructor() {
    this.initObservables()
  }

  setIframeElementRef(elementRef: ElementRef) {
    this.iframeElementRef = elementRef
  }

  postMessage(options: {}) {
    if (!this.iframeElementRef) {
      return
    }
    const contentWindow = this.iframeElementRef.nativeElement.contentWindow
    if (!contentWindow) {
      return
    }
    contentWindow.postMessage(options, '*')
  }

  private initObservables() {
    this.message$ = this.getMessage$()
    this.showModal$ = this.getShowModal$()
    this.iframeUrlSuccess$ = this.getIframeUrlSuccess$()
    this.iframeUrlBlocked$ = this.getIframeUrlBlocked$()
    this.iframeTitle$ = this.getIframeTitle$()
  }

  private getMessage$(): Observable<MessageEvent> {
    return <Observable<MessageEvent>>fromEvent(window, 'message').pipe(
      tap(x => console.log(x))
    )
  }

  private getShowModal$(): Observable<boolean> {
    return this.message$.pipe(
      map(event => event.data.type),
      filter(type => type === 'modalClose' || type === 'modalOpen'),
      map(type => type === 'modalOpen'),
      distinctUntilChanged()
    )
  }

  private getIframeUrlSuccess$(): Observable<string> {
    return this.message$.pipe(
      map(event => event.data),
      filter((data: MessageEventData) => data.type === 'urlSuccess'),
      map(data => data.data.url),
      filter(url => !!url),
      distinctUntilChanged()
    )
  }

  private getIframeUrlBlocked$(): Observable<string> {
    return this.message$.pipe(
      map(event => event.data),
      filter((data: MessageEventData) => data.type === 'urlBlocked'),
      map(data => data.data.url),
      filter(url => !!url),
      distinctUntilChanged()
    )
  }

  private getIframeTitle$(): Observable<string> {
    return this.message$.pipe(
      map(event => event.data),
      filter((data: MessageEventData) => data.type === 'changeTitle'),
      map(data => data.data.title),
      filter(title => !!title),
      distinctUntilChanged()
    )
  }
}
