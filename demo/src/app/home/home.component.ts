import { Component, OnInit, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'app-home',
  template: `
    <p>
      home works!
    </p>
    Jump to <a [routerLink]="['/about-us']">About Us</a>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
