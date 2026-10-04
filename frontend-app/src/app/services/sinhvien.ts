import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  updateSinhVien(ma_sv: string, sinhvien: any) {
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