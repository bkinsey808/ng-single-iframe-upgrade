import { inject, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { NgSingleIframeUpgradeService } from './../../ng-single-iframe-upgrade'

describe('NgSingleIframeUpgradeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [NgSingleIframeUpgradeService]
    })
  })

  it(
    'should be calculate the sum',
    inject(
      [NgSingleIframeUpgradeService],
      (sumService: NgSingleIframeUpgradeService) => {
        expect(1).toEqual(1)
      }
    )
  )
})
