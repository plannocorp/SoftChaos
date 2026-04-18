import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface LoginData {
  token: string;
  type: string;
  userId: number;
  email: string;
  name: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
  timestamp: string;
}

@Component({
  selector: 'app-auth-modern',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth-modern.html',
  styleUrl: './auth-modern.css',
})
export class AuthModern {
  public email = '';
  public password = '';
  public loading = false;
  public error = '';
  public showPassword = false;

  constructor(private http: HttpClient, private router: Router) {}

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  public login(): void {
    const normalizedEmail = this.normalizeEmail(this.email);
    const normalizedPassword = this.normalizePassword(this.password);

    this.email = normalizedEmail;
    this.password = normalizedPassword;

    if (!normalizedEmail || !normalizedPassword) {
      this.error = 'Preencha email e senha para continuar.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';

    this.http.post<LoginResponse>('/api/auth/login', {
      email: normalizedEmail,
      password: normalizedPassword,
    }).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.success && response.data.token) {
          localStorage.setItem('auth', JSON.stringify(response.data));
          localStorage.setItem('token', response.data.token);
          this.router.navigate(['/security/adimin-dashboard']);
        } else {
          this.error = 'Nao foi possivel iniciar a sessao.';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = err.error?.message || 'Email ou senha invalidos.';
      }
    });
  }

  private normalizeEmail(value: string): string {
    return value
      .normalize('NFKC')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();
  }

  private normalizePassword(value: string): string {
    return value
      .normalize('NFKC')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();
  }
}
