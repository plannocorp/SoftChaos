import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NewsletterService } from '../../../services/newsletter';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  currentYear = new Date().getFullYear();
  name = '';
  email = '';
  loading = false;
  message = '';
  error = '';

  constructor(private newsletterService: NewsletterService) {}

  subscribeNewsletter(): void {
    if (!this.email.trim()) {
      this.error = 'Informe um email valido.';
      this.message = '';
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';

    this.newsletterService.subscribe({
      name: this.name.trim() || undefined,
      email: this.email.trim()
    }).subscribe({
      next: () => {
        this.message = 'Inscricao realizada com sucesso.';
        this.name = '';
        this.email = '';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Nao foi possivel concluir sua inscricao agora.';
        this.loading = false;
      }
    });
  }
}

