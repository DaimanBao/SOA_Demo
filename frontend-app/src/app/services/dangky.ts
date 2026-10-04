import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DangkyService {

  private apiUrl = 'http://localhost:3000/api/dangky';

  constructor(private http: HttpClient) {}

  getAllDangKy() {
    return this.http.get(this.apiUrl);
  }

  getDangKyById(ma_dk: number) {
    return this.http.get(
      `${this.apiUrl}/${ma_dk}`
    );
  }

  createDangKy(dangky: any) {
    return this.http.post(
      this.apiUrl,
      dangky
    );
  }

  updateDangKy(
    ma_dk: number,
    dangky: any
  ) {
    return this.http.put(
      `${this.apiUrl}/${ma_dk}`,
      dangky
    );
  }

  deleteDangKy(ma_dk: number) {
    return this.http.delete(
      `${this.apiUrl}/${ma_dk}`
    );
  }
}