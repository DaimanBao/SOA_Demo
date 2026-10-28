import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { AuthService } from '../../services/auth';
import { DangkyService } from '../../services/dangky';
import { DetaiService } from '../../services/detai';
import { SinhvienService } from '../../services/sinhvien';

import { Dangky } from './dangky';

describe('Dangky', () => {
  let component: Dangky;
  let fixture: ComponentFixture<Dangky>;
  let registrations: Subject<unknown[]>;

  beforeEach(async () => {
    registrations = new Subject<unknown[]>();

    await TestBed.configureTestingModule({
      imports: [Dangky],
      providers: [
        {
          provide: DangkyService,
          useValue: { getAllDangKy: () => registrations.asObservable() },
        },
        {
          provide: DetaiService,
          useValue: { getAllDeTai: () => of([]) },
        },
        {
          provide: SinhvienService,
          useValue: { getAllSinhVien: () => of([]) },
        },
        {
          provide: AuthService,
          useValue: { getUser: () => ({ role: 'ADMIN' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dangky);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders registrations as soon as the asynchronous request returns', () => {
    fixture.detectChanges();

    registrations.next([
      {
        ma_dk: 7,
        ma_sv: 'SV007',
        ma_dt: 'DT007',
        ngay_dang_ky: '2026-10-28',
        trang_thai: 'DA_DANG_KY',
        diem: null,
      },
    ]);

    expect(fixture.nativeElement.textContent).toContain('#7');
    expect(fixture.nativeElement.textContent).toContain('SV007');
  });
});
