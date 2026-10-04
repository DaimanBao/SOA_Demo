import { TestBed } from '@angular/core/testing';

import { Sinhvien } from './sinhvien';

describe('Sinhvien', () => {
  let service: Sinhvien;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sinhvien);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
