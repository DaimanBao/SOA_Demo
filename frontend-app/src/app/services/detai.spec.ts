import { TestBed } from '@angular/core/testing';

import { Detai } from './detai';

describe('Detai', () => {
  let service: Detai;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Detai);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
