import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DetaiService {

  private apiUrl = 'http://localhost:3000/api/detai';

  constructor(private http: HttpClient) {}

  getAllDeTai() {
    return this.http.get(this.apiUrl);
  }

  createDeTai(detai: any) {
    return this.http.post(this.apiUrl, detai);
  }

  updateDeTai(ma_dt: string, detai: any) {
    return this.http.put(
      `${this.apiUrl}/${ma_dt}`,
      detai
    );
  }

  deleteDeTai(ma_dt: string) {
    return this.http.delete(
      `${this.apiUrl}/${ma_dt}`
    );
  }
}