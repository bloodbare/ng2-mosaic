/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { ConfigurationService } from './configuration.service';

describe('Service: Configuration', () => {
  beforeEach(() => {
    addProviders([ConfigurationService]);
  });

  it('should ...',
    inject([ConfigurationService],
      (service: ConfigurationService) => {
        expect(service).toBeTruthy();
      }));
});
