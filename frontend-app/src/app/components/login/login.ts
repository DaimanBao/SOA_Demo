
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  passwordVisible = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin(username: string, password: string): void {
    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(normalizedUsername, password)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.router.navigate([
            response.user.must_change_password
              ? '/change-password'
              : '/dashboard'
          ]);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage =
            error.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
          this.cdr.detectChanges();
        }
      });
  }
}
