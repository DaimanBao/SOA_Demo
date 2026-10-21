import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SinhvienService } from '../../services/sinhvien';
import { AuthService } from '../../services/auth';
@Component({
  selector: 'app-sinhvien',
  imports: [FormsModule],
  templateUrl: './sinhvien.html',
  styleUrl: './sinhvien.css'
})
  
export class Sinhvien implements OnInit {
  sinhviens: any[] = [];
  provisioningStudentIds = new Set<string>();
  provisionedStudentIds = new Set<string>();
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
    private cdr: ChangeDetectorRef,
    public authService: AuthService
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
    this.sinhvienService.createSinhVien(this.newSinhVien).subscribe({
      next: (data: any) => {
        this.sinhviens = [...this.sinhviens, data];
        this.resetForm();
        this.cdr.detectChanges();
        this.provisionStudentAccount(data.ma_sv);
      },
      error: (error) => {
        console.error(error);
        alert('Không thể thêm sinh viên');
      }
    });
  }

  provisionStudentAccount(ma_sv: string): void {
    if (
      this.provisioningStudentIds.has(ma_sv) ||
      this.provisionedStudentIds.has(ma_sv)
    ) {
      return;
    }

    this.provisioningStudentIds.add(ma_sv);
    this.authService.provisionStudentAccount(ma_sv).subscribe({
      next: (result) => {
        this.provisioningStudentIds.delete(ma_sv);
        this.provisionedStudentIds.add(ma_sv);
        this.cdr.detectChanges();

        if (result.created) {
          alert(
            `Đã tạo tài khoản sinh viên.\n\nTên đăng nhập: ${result.username}\nMật khẩu ban đầu: ${result.initial_password}\n\nHãy gửi riêng thông tin này cho sinh viên. Sinh viên phải đổi mật khẩu sau lần đăng nhập đầu tiên.`
          );
          return;
        }

        alert(`Sinh viên đã có tài khoản: ${result.username}`);
      },
      error: (error) => {
        this.provisioningStudentIds.delete(ma_sv);
        this.cdr.detectChanges();
        console.error('Lỗi cấp tài khoản sinh viên:', error);
        alert(
          `Hồ sơ sinh viên ${ma_sv} đã được tạo nhưng chưa cấp được tài khoản. ` +
          (error.error?.message || 'Vui lòng thử lại bằng nút Cấp tài khoản.')
        );
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
      const ma_sv: string = this.newSinhVien.ma_sv;
      const updateInput = {
        ho_ten: this.newSinhVien.ho_ten,
        ngay_sinh: this.newSinhVien.ngay_sinh || null,
        gioi_tinh: this.newSinhVien.gioi_tinh || null,
        email: this.newSinhVien.email || null,
        so_dien_thoai: this.newSinhVien.so_dien_thoai || null,
        lop: this.newSinhVien.lop
      };
      console.log(
        'Đang cập nhật sinh viên:',
        { ma_sv, ...updateInput }
      );
      this.sinhvienService
        .updateSinhVien(
          ma_sv,
          updateInput
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