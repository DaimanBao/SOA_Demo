import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DetaiService } from '../../services/detai';
@Component({
  selector: 'app-detai',
  imports: [FormsModule],
  templateUrl: './detai.html',
  styleUrl: './detai.css'
})
  
export class Detai implements OnInit {
  detais: any[] = [];
  newDeTai: any = {
    ma_dt: '',
    ten_dt: '',
    giang_vien: '',
    so_luong_sv: 1,
    trang_thai: 'DANG_MO'
  };

  editing = false;

  constructor(
    private detaiService: DetaiService,
    private cdr: ChangeDetectorRef
  ) { }
  
  ngOnInit(): void {
    this.loadDeTai();
  }

  loadDeTai(): void {
    this.detaiService.getAllDeTai().subscribe({
      next: (data: any) => {
        console.log('Danh sách đề tài:', data);
        this.detais = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(
          'Lỗi khi lấy danh sách đề tài:',
          error
        );
      }
    });
  }

  createDeTai(): void {
    this.detaiService
      .createDeTai(this.newDeTai)
      .subscribe({
        next: (data: any) => {
          this.detais = [
            ...this.detais,
            data
          ];
          this.resetForm();
          this.cdr.detectChanges();
          alert('Thêm đề tài thành công');
        },
        error: (error) => {
          console.error(
            'Lỗi thêm đề tài:',
            error
          );
          alert(
            error.error?.error ||
            'Không thể thêm đề tài'
          );
        }
      });
  }

  editDeTai(detai: any): void {
    this.newDeTai = {
      ...detai
    };
    this.editing = true;
    this.cdr.detectChanges();
  }

  updateDeTai(): void {
    const ma_dt = this.newDeTai.ma_dt;
    console.log(
      'Đang cập nhật đề tài:',
      this.newDeTai
    );
    this.detaiService
      .updateDeTai(
        ma_dt,
        this.newDeTai
      )
      .subscribe({
        next: (data: any) => {
          console.log(
            'Backend trả về sau khi update:',
            data
          );
          this.detais = this.detais.map(
            detai => {
              if (detai.ma_dt === ma_dt) {
                return data;
              }
              return detai;
            }
          );
          this.resetForm();
          this.cdr.detectChanges();
          alert('Cập nhật đề tài thành công');
        },
        error: (error) => {
          console.error(
            'Lỗi update đề tài:',
            error
          );
          alert(
            error.error?.error ||
            'Không thể cập nhật đề tài'
          );
        }
      });
  }

  deleteDeTai(ma_dt: string): void {
    if (
      !confirm(
        'Bạn có chắc muốn xóa đề tài này?'
      )
    ) {
      return;
    }
    this.detaiService
      .deleteDeTai(ma_dt)
      .subscribe({
        next: () => {
          this.detais = this.detais.filter(
            detai =>
              detai.ma_dt !== ma_dt
          );
          this.cdr.detectChanges();
          alert('Xóa đề tài thành công');
        },
        error: (error) => {
          console.error(
            'Lỗi delete đề tài:',
            error
          );
          alert(
            error.error?.error ||
            'Không thể xóa đề tài'
          );
        }
      });
  }

  resetForm(): void {
    this.newDeTai = {
      ma_dt: '',
      ten_dt: '',
      giang_vien: '',
      so_luong_sv: 1,
      trang_thai: 'DANG_MO'
    };
    this.editing = false;
  }

}