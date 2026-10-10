import { Injectable } from '@angular/core';

export interface AuthData {
  token: string;
  type: string;
  userId: number;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (typeof payload.exp === 'number' && payload.exp * 1000 > Date.now()) return token;
    } catch { /* Stored sessions can be corrupt or incomplete. */ }
    this.logout();
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserData(): AuthData | null {
    const auth = localStorage.getItem('auth');
    if (!auth) return null;
    try { return JSON.parse(auth); } catch { this.logout(); return null; }
  }

  getUserName(): string {
    const userData = this.getUserData();
    return userData?.name || '';
  }

  logout(): void {
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
  }
}
