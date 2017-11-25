import { Component, OnInit, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'app-home',
  template: `
    <p>
      home works!
    </p>
    Jump to <a [routerLink]="['/about-us']">About Us</a>
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
export class HomeComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
