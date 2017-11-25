import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { LegacyRoutingService } from 'ng-single-iframe-upgrade'

@Component({
  selector: 'app-header',
  template: `
      Header implemented as modern. Main is legacy? '{{legacyRouting.legacyMode$ | async}}'
      <button (click)="legacyRouting.setModernMode()">switch to angular</button>
      <button (click)="legacyRouting.setLegacyMode()">switch to angularjs</button>
  `,
  styles: [
    `
    :host {
      background-color: lightblue;
    }
  `
  ]
})
export class HeaderComponent implements OnInit {
  constructor(public legacyRouting: LegacyRoutingService) {}

  ngOnInit() {}
}
