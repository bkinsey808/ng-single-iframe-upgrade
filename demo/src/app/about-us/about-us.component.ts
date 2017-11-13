import { Component, OnInit, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'app-about-us',
  template: `
    <p>
      about-us works!
    </p>
    Jump to <a [routerLink]="['/home']">Home</a>

    `,
  styles: [],
  encapsulation: ViewEncapsulation.None
})
export class AboutUsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
