import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DangkyService } from '../../services/dangky';
import { AuthService } from '../../services/auth';
import { DetaiService } from '../../services/detai';
import { SinhvienService } from '../../services/sinhvien';

interface DeTaiOption {
  ma_dt: string;
  ten_dt: string;
  giang_vien: string;
  trang_thai: string;
}

interface SinhVienOption {
  ma_sv: string;
  ho_ten: string;
  lop: string;
}

@Component({
  selector: 'app-dangky',
  imports: [FormsModule],
  templateUrl: './dangky.html',
  styleUrl: './dangky.css'
})
export class Dangky implements OnInit {
  dangkys: any[] = [];
  detaiOptions: DeTaiOption[] = [];
  detaiRecords: DeTaiOption[] = [];
  sinhvienOptions: SinhVienOption[] = [];
  detaiOptionsError = false;
  sinhvienOptionsError = false;
  newDangKy: any = {
    ma_sv: '',
    ma_dt: '',
    ngay_dang_ky: '',
    trang_thai: 'DA_DANG_KY',
    diem: null
  };
  editing = false;
  constructor(
    private dangkyService: DangkyService,
    private cdr: ChangeDetectorRef,
    private detaiService: DetaiService,
    private sinhvienService: SinhvienService,
    public authService: AuthService
  ) { }
  
  ngOnInit(): void {
    this.resetForm();
    this.loadDangKy();
    this.loadDeTaiOptions();
    this.loadSinhVienOptions();
  }

  loadDeTaiOptions(): void {
    this.detaiService.getAllDeTai().subscribe({
      next: (data: any) => {
        this.detaiRecords = data;
        this.detaiOptions = data.filter(
          (detai: DeTaiOption) => detai.trang_thai === 'DANG_MO'
        );
        this.attachRegistrationDetails();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.detaiOptionsError = true;
        console.error('Lỗi khi lấy danh sách đề tài để đăng ký:', error);
        this.cdr.detectChanges();
      }
    });
  }

  loadSinhVienOptions(): void {
    this.sinhvienService.getAllSinhVien().subscribe({
      next: (data: any) => {
        this.sinhvienOptions = data;
        this.attachRegistrationDetails();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.sinhvienOptionsError = true;
        console.error('Lỗi khi lấy danh sách sinh viên để đăng ký:', error);
        this.cdr.detectChanges();
      }
    });
  }

  loadDangKy(): void {
    this.dangkyService.getAllDangKy().subscribe({
      next: (data: any) => {
        console.log(
          'Danh sách đăng ký:',
          data
        );
        this.dangkys = data;
        this.attachRegistrationDetails();
      },
      error: (error) => {
        console.error(
          'Lỗi lấy danh sách đăng ký:',
          error
        );
      }
    });
  }

  private attachRegistrationDetails(): void {
    this.dangkys.forEach(dangky => {
      dangky.sinh_vien = this.sinhvienOptions.find(
        sinhvien => sinhvien.ma_sv === dangky.ma_sv
      );
      dangky.de_tai = this.detaiRecords.find(
        detai => detai.ma_dt === dangky.ma_dt
      );
    });
  }

  createDangKy(): void {
    const isAdmin = this.authService.getUser()?.role === 'ADMIN';
    const request = {
      ma_sv: this.newDangKy.ma_sv,
      ma_dt: this.newDangKy.ma_dt,
      ...(isAdmin && {
        ngay_dang_ky: this.newDangKy.ngay_dang_ky
      })
    };

    this.dangkyService
      .createDangKy(request)
      .subscribe({
        next: (data: any) => {
          console.log(
            'Đăng ký thành công:',
            data
          );
          this.loadDangKy();
          this.resetForm();
          alert(
            'Thêm đăng ký thành công'
          );
        },
        error: (error) => {
          console.error(
            'Lỗi thêm đăng ký:',
            error
          );
          alert(
            error.error?.message ||
            error.error?.error ||
            'Không thể thêm đăng ký'
          );
        }
      });
  }

  editDangKy(dangky: any): void {
    this.newDangKy = {
      ma_dk: dangky.ma_dk,
      ma_sv: dangky.ma_sv,
      ma_dt: dangky.ma_dt,
      ngay_dang_ky:
        dangky.ngay_dang_ky
          ? dangky.ngay_dang_ky.substring(0, 10)
          : '',
      trang_thai:
        dangky.trang_thai,
      diem:
        dangky.diem
    };
    this.editing = true;
    this.cdr.detectChanges();
  }

  updateDangKy(): void {
    const ma_dk =
      this.newDangKy.ma_dk;
    this.dangkyService
      .updateDangKy(
        ma_dk,
        this.newDangKy
      )
      .subscribe({
        next: (data: any) => {
          console.log(
            'Cập nhật đăng ký:',
            data
          );
          this.loadDangKy();
          this.resetForm();
          alert(
            'Cập nhật đăng ký thành công'
          );
        },
        error: (error) => {
          console.error(
            'Lỗi cập nhật đăng ký:',
            error
          );
          alert(
            error.error?.error ||
            'Không thể cập nhật đăng ký'
          );
        }
      });
  }

  deleteDangKy(
    ma_dk: number
  ): void {
    if (
      !confirm(
        'Bạn có chắc muốn xóa đăng ký này?'
      )
    ) {
      return;
    }
    this.dangkyService
      .deleteDangKy(ma_dk)
      .subscribe({
        next: () => {
          this.dangkys =
            this.dangkys.filter(
              dangky =>
                dangky.ma_dk !== ma_dk
            );
          this.cdr.detectChanges();
          alert(
            'Xóa đăng ký thành công'
          );
        },
        error: (error) => {
          console.error(
            'Lỗi xóa đăng ký:',
            error
          );
          alert(
            'Không thể xóa đăng ký'
          );
        }
      });
  }

  resetForm(): void {
    this.newDangKy = {
      ma_sv:
        this.authService.getUser()?.role === 'STUDENT'
          ? this.authService.getUser()?.ma_sv ?? ''
          : '',
      ma_dt: '',
      ngay_dang_ky: this.getToday(),
      trang_thai:
        'DA_DANG_KY',
      diem: null
    };
    this.editing = false;
  }

  private getToday(): string {
    const today = new Date();
    const localDate = new Date(
      today.getTime() - today.getTimezoneOffset() * 60_000
    );
    return localDate.toISOString().slice(0, 10);
  }
  
}