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
    'should set the legacy base',
    inject(
      [NgSingleIframeUpgradeService],
      (simpleUpgradeService: NgSingleIframeUpgradeService) => {
        NgSingleIframeUpgradeService.setDisplayLegacyBase('legacy')
        expect(NgSingleIframeUpgradeService.getDisplayLegacyBase()).toEqual(
          'legacy'
        )
      }
    )
  )

  it(
    'should identify legacy url',
    inject(
      [NgSingleIframeUpgradeService],
      (simpleIframeUpgrade: NgSingleIframeUpgradeService) => {
        NgSingleIframeUpgradeService.setDisplayLegacyBase('legacy')
        expect(simpleIframeUpgrade.isLegacyUrl('/legacy/dashboard')).toEqual(
          true
        )
      }
    )
  )
})
