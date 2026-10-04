import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Detai } from './detai';

describe('Detai', () => {
  let component: Detai;
  let fixture: ComponentFixture<Detai>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detai],
    }).compileComponents();

    fixture = TestBed.createComponent(Detai);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
