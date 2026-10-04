import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sinhvien } from './sinhvien';

describe('Sinhvien', () => {
  let component: Sinhvien;
  let fixture: ComponentFixture<Sinhvien>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sinhvien],
    }).compileComponents();

    fixture = TestBed.createComponent(Sinhvien);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
