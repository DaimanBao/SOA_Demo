import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface SinhVienUpdateInput {
  ho_ten: string;
  ngay_sinh: string | null;
  gioi_tinh: string | null;
  email: string | null;
  so_dien_thoai: string | null;
  lop: string;
}

@Injectable({
  providedIn: 'root'
})
export class SinhvienService {

  private apiUrl = 'http://localhost:3000/api/sinhvien';

  constructor(private http: HttpClient) {}

  getAllSinhVien() {
    return this.http.get(this.apiUrl);
  }

  createSinhVien(sinhvien: any) {
    return this.http.post(this.apiUrl, sinhvien);
  }

  updateSinhVien(ma_sv: string, sinhvien: SinhVienUpdateInput) {
    return this.http.put(
      `${this.apiUrl}/${ma_sv}`,
      sinhvien
    );
  }

  deleteSinhVien(ma_sv: string) {
    return this.http.delete(
      `${this.apiUrl}/${ma_sv}`
    );
  }
}