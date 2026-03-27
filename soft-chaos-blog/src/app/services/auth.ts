import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());

  constructor(private http: HttpClient) {}

  // ✅ Pega token salvo pelo Auth
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Verifica login
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ✅ Dados do usuário
  getUserData(): AuthData | null {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth) : null;
  }

  // ✅ Nome para dashboard
  getUserName(): string {
    const userData = this.getUserData();
    return userData?.name || '';
  }

  // ✅ Logout
  logout() {
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }

  // ✅ Headers para requests
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
