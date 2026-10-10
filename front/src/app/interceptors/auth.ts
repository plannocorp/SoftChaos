import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { buildApiUrl } from '../config/app-environment';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isRelativeApiRequest = req.url.startsWith('/api/');
  const targetUrl = isRelativeApiRequest ? buildApiUrl(req.url) : req.url;
  const baseRequest = isRelativeApiRequest ? req.clone({ url: targetUrl }) : req;

  if (targetUrl.includes('/api/') && requiresAuthentication(req.method, targetUrl)) {
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

function requiresAuthentication(method: string, url: string): boolean {
  const path = new URL(url, 'https://www.softchaos.blog').pathname;
  const verb = method.toUpperCase();

  if (verb === 'GET') {
    const publicRead = path === '/api/articles'
      || /^\/api\/articles\/(category\/\d+|author\/\d+|featured|pinned|most-viewed|latest|search|slug\/[^/]+|\d+\/related)$/.test(path)
      || path === '/api/categories'
      || /^\/api\/categories\/(slug\/[^/]+|with-articles)$/.test(path)
      || path === '/api/banners/active'
      || path === '/api/pages/published'
      || /^\/api\/pages\/slug\/[^/]+$/.test(path)
      || /^\/api\/comments\/article\/\d+$/.test(path)
      || path === '/api/newsletter/confirm';

    if (publicRead || path === '/api/auth/login') {
      return false;
    }
  }

  if (verb === 'POST'
      && (path === '/api/auth/login'
        || path === '/api/newsletter/subscribe'
        || /^\/api\/comments\/article\/\d+$/.test(path))) {
    return false;
  }

  return true;
}
