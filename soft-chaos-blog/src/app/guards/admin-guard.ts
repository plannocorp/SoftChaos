import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userData = authService.getUserData();
  
  // ✅ Só ADMIN acessa dashboard
  if (!authService.isLoggedIn() || userData?.role !== 'ADMIN') {
    router.navigate(['/security/adimin-auth']);
    return false;
  }
  
  return true;
};
