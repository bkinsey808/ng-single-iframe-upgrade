import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { LegacyRoutingModule } from 'ng-single-iframe-upgrade'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { AboutUsComponent } from './about-us/about-us.component'
import { HomeComponent } from './home/home.component'
import { MainComponent } from './main/main.component'
import { HeaderComponent } from './header/header.component'

@NgModule({
  declarations: [
    AppComponent,
    AboutUsComponent,
    HomeComponent,
    MainComponent,
    HeaderComponent
  ],
  imports: [BrowserModule, AppRoutingModule, LegacyRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
