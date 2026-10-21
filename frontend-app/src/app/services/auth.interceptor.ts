
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');

  // Không đính kèm JWT nếu chưa đăng nhập
  if (!token) {
    return next(req);
  }

  // Chỉ gửi JWT đến API Gateway của dự án
  if (!req.url.startsWith('http://localhost:3000/api/')) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
