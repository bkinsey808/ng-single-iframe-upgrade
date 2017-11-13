import { Component } from '@angular/core'

@Component({
  selector: 'app-root',
  template: `
    <header>
      <app-header></app-header>
    </header>
    <main>
      <app-main></app-main>
    </main>
    `,
  styles: [
    `
    header, app-header, main, app-main {
      position: absolute;
      left: 0;
      right: 0;
    }

    main {
      top: 50px;
      border: 1px solid blue;
    }

    main, app-main {
      bottom: 0
    }

    header, app-header, app-main {
      top: 0;
    }

    header {
      height: 50px;
    }

    app-header {
      border: 1px solid green;
      bottom: 0;
    }




  `
  ]
})
export class AppComponent {}
