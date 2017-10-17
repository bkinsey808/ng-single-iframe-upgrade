import { NgModule, ModuleWithProviders } from '@angular/core'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'

import { LegacyRoutingService } from '../services/legacy-routing.service'
import { IframeMessagesService } from '../services/iframe-messages.service'
import { LegacyRoutingComponent } from './legacy-routing.component'

@NgModule({
  declarations: [
    LegacyRoutingComponent
    // Pipes.
    // Directives.
  ],
  exports: [
    LegacyRoutingComponent,
    CommonModule
    // Pipes.
    // Directives.
  ],
  imports: [CommonModule]
})
export class NgSingleIframeUpgradeModule {
  /**
   *  Use in AppModule: new instance of LegacyRoutingService.
   */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgSingleIframeUpgradeModule,
      providers: [LegacyRoutingService, IframeMessagesService, Router]
    }
  }

  /**
     * Use in features modules with lazy loading: new instance of NgSingleIframeUpgradeService.
     */
  static forChild(): ModuleWithProviders {
    return {
      ngModule: NgSingleIframeUpgradeModule,
      providers: [LegacyRoutingService, IframeMessagesService, Router]
    }
  }
}
