import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { HomeComponent } from './home/home.component'
import { AboutUsComponent } from './about-us/about-us.component'

import {
  LegacyRoutingModule,
  LegacyRoutingConfig
} from 'ng-single-iframe-upgrade'

const ACTUAL_LEGACY_BASE = 'ng1'
const DISPLAY_LEGACY_BASE = 'legacy'
const LEGACY_START_PATH = 'welcome'

const legacyRoutingConfig: LegacyRoutingConfig = {
  actualLegacyBase: ACTUAL_LEGACY_BASE,
  displayLegacyBase: DISPLAY_LEGACY_BASE,
  legacyStartPath: LEGACY_START_PATH
}

const routes: Routes = [
  {
    path: 'about-us',
    component: AboutUsComponent
  },
  {
    path: DISPLAY_LEGACY_BASE,
    pathMatch: 'prefix',
    children: [
      {
        path: '**',
        component: HomeComponent
      }
    ]
  },
  {
    path: '',
    component: HomeComponent
  }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    LegacyRoutingModule.forRoot(legacyRoutingConfig)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
