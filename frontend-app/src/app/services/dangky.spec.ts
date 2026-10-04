import { TestBed } from '@angular/core/testing';

import { Dangky } from './dangky';

describe('Dangky', () => {
  let service: Dangky;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Dangky);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
