import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DangkyService } from '../../services/dangky';
@Component({
  selector: 'app-dangky',
  imports: [FormsModule],
  templateUrl: './dangky.html',
  styleUrl: './dangky.css'
})
export class Dangky implements OnInit {
  dangkys: any[] = [];
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
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.loadDangKy();
  }
  loadDangKy(): void {
    this.dangkyService.getAllDangKy().subscribe({
      next: (data: any) => {
        console.log(
          'Danh sách đăng ký:',
          data
        );
        this.dangkys = data;
        this.loadDetailForEachDangKy();
      },
      error: (error) => {
        console.error(
          'Lỗi lấy danh sách đăng ký:',
          error
        );
      }
    });
  }
  loadDetailForEachDangKy(): void {
    this.dangkys.forEach(dangky => {
      this.dangkyService
        .getDangKyById(dangky.ma_dk)
        .subscribe({
          next: (detail: any) => {
            dangky.sinh_vien =
              detail.sinh_vien;
            dangky.de_tai =
              detail.de_tai;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error(
              `Không thể lấy chi tiết đăng ký ${dangky.ma_dk}:`,
              error
            );
          }
        });
    });
  }
  createDangKy(): void {
    this.dangkyService
      .createDangKy(this.newDangKy)
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
      ma_sv: '',
      ma_dt: '',
      ngay_dang_ky: '',
      trang_thai:
        'DA_DANG_KY',
      diem: null
    };
    this.editing = false;
  }
}