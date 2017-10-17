import { Injectable, ElementRef } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { fromEvent } from 'rxjs/observable/fromEvent'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/distinctUntilChanged'

interface MessageEvent {
  data: {
    type: EventDataType
    data: {
      url?: string
    }
  }
}
type EventDataType = 'modalClose' | 'modalOpen' | 'urlChange'

/** 
 * handles all messages to and from the iframe 
 */
@Injectable()
export class IframeMessagesService {
  /**
   * public (output) observables
   */
  showModal$: Observable<boolean>
  iframeOriginatedPathnameChange$: Observable<string>

  /** the iframe element */
  private iframeElementRef: ElementRef

  /** raw (input) observable of messages coming from the iframe */
  private message$: Observable<MessageEvent>

  setIframeElementRef(elementRef: ElementRef) {
    this.iframeElementRef = elementRef
  }
  getIframeElementRef() {
    return this.iframeElementRef
  }

  constructor() {
    this.message$ = fromEvent(window, 'message')

    this.showModal$ = this.message$
      .map(event => <String>event.data.type)
      .filter((type: String) => type === 'modalClose' || type === 'modalOpen')
      .map(type => type === 'modalOpen')
      .distinctUntilChanged()

    this.iframeOriginatedPathnameChange$ = this.message$
      .map(event => event.data)
      .filter(data => data.type === 'urlChange')
      .map(data => <string>data.data.url)
      .map(url => new URL(url).pathname)
      .distinctUntilChanged()
  }

  postMessage(actualUrl: string) {
    this.iframeElementRef.nativeElement.contentWindow.postMessage(
      {
        changeUrl: actualUrl
      },
      '*'
    )
  }
}
