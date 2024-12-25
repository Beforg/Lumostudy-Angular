import { TestBed } from '@angular/core/testing';

import { ReesService } from './rees.service';

describe('ReesService', () => {
  let service: ReesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
