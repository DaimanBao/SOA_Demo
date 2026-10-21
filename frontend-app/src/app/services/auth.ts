
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  id: number;
  username: string;
  role: string;
  ma_sv: string | null;
  must_change_password?: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
  
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'auth_user';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.access_token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
      })
    );
  }

  provisionStudentAccount(ma_sv: string) {
    return this.http.post<{
      created: boolean;
      username: string;
      initial_password?: string;
    }>(`${this.apiUrl}/admin/provision-student`, { ma_sv });
  }

  changePassword(current_password: string, new_password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/change-password`, {
      current_password,
      new_password
    }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.access_token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): AuthUser | null {
    const user = localStorage.getItem(this.userKey);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as AuthUser;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  mustChangePassword(): boolean {
    return this.getUser()?.must_change_password === true;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
}
