/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { LayoutService } from './layout.service';

describe('Service: Layout', () => {
  beforeEach(() => {
    addProviders([LayoutService]);
  });

  it('should ...',
    inject([LayoutService],
      (service: LayoutService) => {
        expect(service).toBeTruthy();
      }));
});
