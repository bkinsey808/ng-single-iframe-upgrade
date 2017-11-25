import { Component } from '@angular/core'

@Component({
  selector: 'app-about-us',
  template: `
    <p>
      about-us works!!
    </p>
    Jump to <a [routerLink]="['/']">Home</a>

    `,
  styles: [
    `
      :host {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        background-color: lightblue;
      }
    `
  ]
})
export class AboutUsComponent {
  constructor() {}
}
