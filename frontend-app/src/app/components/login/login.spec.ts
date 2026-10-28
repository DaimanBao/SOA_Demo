import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { AuthService } from '../../services/auth';

import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display an invalid-credentials error and stop loading immediately', () => {
    authService.login.mockReturnValue(
      throwError(() => ({
        error: { message: 'Sai tài khoản hoặc mật khẩu' },
      })),
    );

    component.onLogin('student', 'wrong-password');
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(
      fixture.nativeElement.querySelector('.error-message')?.textContent,
    ).toContain('Sai tài khoản hoặc mật khẩu');
  });
});
