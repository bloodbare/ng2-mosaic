/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ObjectService } from './object.service';

describe('Service: Object', () => {
  beforeEach(() => {
    TestBed.configureTestingModule([ObjectService]);
  });

  it('should ...',
    inject([ObjectService],
      (service: ObjectService) => {
        expect(service).toBeTruthy();
      }));
});
