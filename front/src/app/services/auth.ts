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
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserData(): AuthData | null {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth) : null;
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
