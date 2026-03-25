import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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
  selector: 'app-auth',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  public email = '';
  public password = '';
  public loading = false;
  public error = '';
  readonly title = signal('soft-chaos-blog');

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.loading = true;
    this.error = '';

    const payload = {
      email: this.email,
      password: this.password
    };

    this.http.post<LoginResponse>('/api/auth/login', payload).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data.token) {
          // Salva tudo no localStorage
          localStorage.setItem('auth', JSON.stringify(response.data));
          localStorage.setItem('token', response.data.token);
          
          console.log('✅ Login OK:', response.data);
          this.router.navigate(['/security/adimin-dashboard']);  // Home
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = err.error?.message || 'Email ou senha inválidos';
        console.error('❌ Login falhou:', err);

        alert(this.error);
      }
    });
  }
}
