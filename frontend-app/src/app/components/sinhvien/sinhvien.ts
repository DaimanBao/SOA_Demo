import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SinhvienService } from '../../services/sinhvien';
@Component({
  selector: 'app-sinhvien',
  imports: [FormsModule],
  templateUrl: './sinhvien.html',
  styleUrl: './sinhvien.css'
})
  
export class Sinhvien implements OnInit {
  sinhviens: any[] = [];
  newSinhVien: any = {
    ma_sv: '',
    ho_ten: '',
    ngay_sinh: '',
    gioi_tinh: '',
    email: '',
    so_dien_thoai: '',
    lop: ''
  };

  editing = false;

  constructor(
    private sinhvienService: SinhvienService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSinhVien();
  }

  loadSinhVien(): void {
      this.sinhvienService.getAllSinhVien().subscribe({
        next: (data: any) => {
          console.log('Danh sách sinh viên:', data);
          this.sinhviens = data;
          // Ép Angular render lại
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(
            'Lỗi khi lấy danh sách sinh viên:',
            error
          );
        }
      });
  }
  
  createSinhVien(): void {
      this.sinhvienService
        .createSinhVien(this.newSinhVien)
        .subscribe({
          next: (data: any) => {
            // Thêm sinh viên mới vào danh sách
            this.sinhviens = [
              ...this.sinhviens,
              data
            ];
            this.resetForm();
            // Ép Angular render
            this.cdr.detectChanges();
            alert('Thêm sinh viên thành công');
          },
          error: (error) => {
            console.error(error);
            alert('Không thể thêm sinh viên');
          }
        });
  }
  
  editSinhVien(sinhvien: any): void {
    this.newSinhVien = {
      ...sinhvien,
      ngay_sinh: sinhvien.ngay_sinh
        ? sinhvien.ngay_sinh.substring(0, 10)
        : ''
    };
    this.editing = true;
    this.cdr.detectChanges();
  }

  updateSinhVien(): void {
      const ma_sv = this.newSinhVien.ma_sv;
      console.log(
        'Đang cập nhật sinh viên:',
        this.newSinhVien
      );
      this.sinhvienService
        .updateSinhVien(
          ma_sv,
          this.newSinhVien
        )
        .subscribe({
          next: (data: any) => {
            console.log(
              'Backend trả về sau khi update:',
              data
            );
            /*
            * Thay thế sinh viên cũ
            * bằng dữ liệu mới từ Backend
            */
            this.sinhviens = this.sinhviens.map(
              sinhvien => {
                if (sinhvien.ma_sv === ma_sv) {
                  return data;
                }
                return sinhvien;
              }
            );
            console.log(
              'Danh sách sau khi update:',
              this.sinhviens
            );
            // Thoát chế độ edit
            this.resetForm();
            // Ép Angular render ngay lập tức
            this.cdr.detectChanges();
            alert('Cập nhật sinh viên thành công');
          },
          error: (error) => {
            console.error(
              'Lỗi update:',
              error
            );
            alert('Không thể cập nhật sinh viên');
          }
        });
  }

  deleteSinhVien(ma_sv: string): void {
      if (!confirm('Bạn có chắc muốn xóa sinh viên này?')) {
        return;
      }
      this.sinhvienService
        .deleteSinhVien(ma_sv)
        .subscribe({
          next: () => {
            this.sinhviens = this.sinhviens.filter(
              sinhvien =>
                sinhvien.ma_sv !== ma_sv
            );
            this.cdr.detectChanges();
            alert('Xóa sinh viên thành công');
          },
          error: (error) => {
            console.error(
              'Lỗi delete:',
              error
            );
            alert('Không thể xóa sinh viên');
          }
        });
  }

  resetForm(): void {
      this.newSinhVien = {
        ma_sv: '',
        ho_ten: '',
        ngay_sinh: '',
        gioi_tinh: '',
        email: '',
        so_dien_thoai: '',
        lop: ''
      };
      this.editing = false;
    }
}