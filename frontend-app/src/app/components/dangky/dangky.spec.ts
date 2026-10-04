import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dangky } from './dangky';

describe('Dangky', () => {
  let component: Dangky;
  let fixture: ComponentFixture<Dangky>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dangky],
    }).compileComponents();

    fixture = TestBed.createComponent(Dangky);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
