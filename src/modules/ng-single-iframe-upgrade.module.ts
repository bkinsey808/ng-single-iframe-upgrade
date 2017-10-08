import { NgModule, ModuleWithProviders } from '@angular/core'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'

import { NgSingleIframeUpgradeService } from '../services/ng-single-iframe-upgrade.service'
import { NgSingleIframeUpgradeComponent } from './ng-single-iframe-upgrade.component'

@NgModule({
  declarations: [
    NgSingleIframeUpgradeComponent
    // Pipes.
    // Directives.
  ],
  exports: [
    NgSingleIframeUpgradeComponent,
    CommonModule
    // Pipes.
    // Directives.
  ],
  imports: [CommonModule]
})
export class NgSingleIframeUpgradeModule {
  /**
     * Use in AppModule: new instance of NgSingleIframeUpgradeService.
     */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgSingleIframeUpgradeModule,
      providers: [NgSingleIframeUpgradeService, Router]
    }
  }

  /**
     * Use in features modules with lazy loading: new instance of NgSingleIframeUpgradeService.
     */
  static forChild(): ModuleWithProviders {
    return {
      ngModule: NgSingleIframeUpgradeModule,
      providers: [NgSingleIframeUpgradeService]
    }
  }
}
