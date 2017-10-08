import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef
} from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { CommonModule } from '@angular/common'

import { Observable } from 'rxjs/Observable'
import { interval } from 'rxjs/observable/interval'

import { NgSingleIframeUpgradeService } from '../services/ng-single-iframe-upgrade.service'

@Component({
  // tslint:disable-next-line
  selector: 'ng-siu',
  template: `
    <iframe #iframe
      id="myIframe"
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
export class NgSingleIframeUpgradeComponent implements OnInit {
  @ViewChild('iframe') iframe: ElementRef

  // iframe url
  url: SafeResourceUrl

  // this is the height in pixels
  height$: Observable<number>

  constructor(
    public ngSingleIframeUpgradeService: NgSingleIframeUpgradeService,
    private sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.keepIframeUrlUpdated()
    this.keepIframeHeightUpdated()
    this.ngSingleIframeUpgradeService.setIframeElementRef(this.iframe)
  }

  private keepIframeUrlUpdated() {
    this.ngSingleIframeUpgradeService.angularJsActualUrl$
      // this filter ensures we do not trigger the iframe to refresh and bootstrap
      .filter((url: string) => {
        return url !== this.iframe.nativeElement.contentWindow.location.pathname
      })
      // what are security implications of this? Something to think about.
      // We should probably figure out how to prevent url attacks from angularJs somehow.
      .map((url: string) => this.sanitizer.bypassSecurityTrustResourceUrl(url))
      .subscribe((url: string) => {
        this.url = url
        this.changeDetectorRef.markForCheck()
      })
  }

  private keepIframeHeightUpdated() {
    const contentObservable$ = interval(50)
      // only bother to resize if angularJs iframe is visible
      .filter(x => this.ngSingleIframeUpgradeService.showIframe$.value)
      // get the iframe document
      .map(x => this.iframe.nativeElement.contentWindow.document)
      // make sure iframe document exists
      .filter(iframeDocument => !!iframeDocument)
      // the #content div is the div in angularJs that is sized to fit content
      .map(iframeDocument => iframeDocument.querySelector('#content'))
      // make sure content exists
      .filter(content => !!content)

    // see https://codepen.io/sambible/post/browser-scrollbar-widths
    const scrollBarPixels = 17

    this.height$ = contentObservable$
      // we don't ever want to see a vertical scrollbar just because a horizontal scrollbar exists
      .map(content => content.clientHeight + scrollBarPixels)
      .distinctUntilChanged()
  }
}
