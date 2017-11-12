import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
  ElementRef
} from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

import { Observable } from 'rxjs/Observable'
import { interval } from 'rxjs/observable/interval'

import { LegacyRoutingService } from '../services/legacy-routing.service'
import { IframeMessagesService } from '../services/iframe-messages.service'
import { filter, map, distinctUntilChanged } from 'rxjs/operators'

/** the iframe component that contains the legacy app */
@Component({
  selector: 'bkng-legacy-routing',
  template: `
    <iframe #iframe
      id="iframe"
      sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"
      [attr.src]="url"
      [style.height.px]="height$ | async"
    ></iframe>
  `,
  styles: [
    `
    iframe {
      position: absolute;
      top: 0;
      left: 0;
      border: 0;
      width: 100%;
      min-height: 100%;
      overflow-y: hidden;
    }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegacyRoutingComponent implements OnInit {
  @ViewChild('iframe') iframe: ElementRef

  // iframe url
  url: SafeResourceUrl

  // this is the height in pixels
  height$: Observable<number>

  constructor(
    public legacyRouting: LegacyRoutingService,
    private iframeMessages: IframeMessagesService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.keepIframeUrlUpdated()
    this.keepIframeHeightUpdated()
    this.legacyRouting.setIframeElementRef(this.iframe)
    this.iframeMessages.setIframeElementRef(this.iframe)
  }

  private keepIframeUrlUpdated() {
    // what are security implications of this? Something to think about.
    // We should probably figure out how to prevent url attacks from angularJs somehow.
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.legacyRouting.getCurrentLegacyUrl()
    )
  }

  private keepIframeHeightUpdated() {
    const contentObservable$ = interval(50).pipe(
      // only bother to resize if angularJs iframe is visible
      filter(() => this.legacyRouting.isLegacyMode()),
      // get the iframe document
      map(() => this.iframe.nativeElement.contentWindow.document),
      // make sure iframe document exists
      filter(iframeDocument => !!iframeDocument),
      // the #content div is the div in angularJs that is sized to fit content
      map(iframeDocument => iframeDocument.querySelector('#content')),
      // make sure content exists
      filter(content => !!content)
    )

    this.height$ = contentObservable$.pipe(
      // we don't ever want to see a vertical scrollbar just because a horizontal scrollbar exists
      map(content => content.clientHeight),
      distinctUntilChanged()
    )
  }
}
