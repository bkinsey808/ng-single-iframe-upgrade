import { inject, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { LegacyRoutingService } from './../../src/services/legacy-routing.service'
import { IframeMessagesService } from './../../src/services/iframe-messages.service'

describe('LegacyRoutingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [LegacyRoutingService, IframeMessagesService]
    })
  })

  it(
    'should set the legacy base',
    inject(
      [LegacyRoutingService],
      (simpleUpgradeService: LegacyRoutingService) => {
        LegacyRoutingService.setDisplayLegacyBase('legacy')
        expect(LegacyRoutingService.getDisplayLegacyBase()).toEqual('legacy')
      }
    )
  )

  it(
    'should identify legacy url',
    inject(
      [LegacyRoutingService],
      (simpleIframeUpgrade: LegacyRoutingService) => {
        LegacyRoutingService.setDisplayLegacyBase('legacy')
        expect(simpleIframeUpgrade.isLegacyUrl('/legacy/dashboard')).toEqual(
          true
        )
      }
    )
  )
})
