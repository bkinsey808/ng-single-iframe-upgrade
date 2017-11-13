import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  HostBinding
} from '@angular/core'
import { LegacyRoutingService } from 'ng-single-iframe-upgrade'

@Component({
  selector: 'app-main',
  template: `
    <div
      id="angular"
      [style.display]="((legacyRouting.legacyMode$ | async) ? 'none' : 'block')"
    ><router-outlet></router-outlet></div>
    <div
      id="angularJs"
      [style.display]="((legacyRouting.legacyMode$ | async) ? 'block' : 'none')"
    ><bkng-legacy-routing></bkng-legacy-routing></div>
  `,
  styles: [
    `
    #angular, #angularjs {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }
    #angular, #angularjs {
      top: 0;
    }
    :host.isLegacyMode #angular {
      display: none;
    }
    :host:not(.isLegacyMode) #angularJs {
      display: none;
    }
  `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent {
  @HostBinding('class.isLegacyMode') isLegacyMode = false

  constructor(public legacyRouting: LegacyRoutingService) {}
}
