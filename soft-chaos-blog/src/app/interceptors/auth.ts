import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { buildApiUrl } from '../config/app-environment';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isRelativeApiRequest = req.url.startsWith('/api/');
  const targetUrl = isRelativeApiRequest ? buildApiUrl(req.url) : req.url;
  const baseRequest = isRelativeApiRequest ? req.clone({ url: targetUrl }) : req;

  // Adiciona token em TODAS /api/* (exceto login)
  if (targetUrl.includes('/api/') && !targetUrl.includes('/api/auth/login')) {
    const token = authService.getToken();
    if (token) {
      const authReq = baseRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq);
    }
  }

  return next(baseRequest);
};
