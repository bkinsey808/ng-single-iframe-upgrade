import { NgModule, ModuleWithProviders } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  LegacyRoutingService,
  LegacyRoutingConfig
} from './services/legacy-routing.service'
import { IframeMessagesService } from './services/iframe-messages.service'
import { LegacyRoutingComponent } from './components/legacy-routing.component'

@NgModule({
  imports: [CommonModule],
  exports: [LegacyRoutingComponent],
  declarations: [LegacyRoutingComponent],
  providers: [LegacyRoutingService, IframeMessagesService]
})
export class LegacyRoutingModule {
  static forRoot(config: LegacyRoutingConfig): ModuleWithProviders {
    // User config get logged here
    return {
      ngModule: LegacyRoutingModule,
      providers: [
        LegacyRoutingService,
        IframeMessagesService,
        { provide: 'config', useValue: config }
      ]
    }
  }
}
