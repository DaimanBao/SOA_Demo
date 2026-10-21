import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-change-password',
  imports: [FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  currentPasswordVisible = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  submit(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Vui lòng nhập đầy đủ các trường mật khẩu.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    this.authService.changePassword(this.currentPassword, this.newPassword)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage =
            error.error?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
