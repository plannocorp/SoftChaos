import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Header } from '../../components/header/header/header';
import { Footer } from '../../components/footer/footer/footer';
import { NewsletterService } from '../../services/newsletter';

@Component({
  selector: 'app-newsletter-page',
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './newsletter-page.html',
  styleUrl: './newsletter-page.css',
})
export class NewsletterPage {
  public name = '';
  public email = '';
  public loading = false;
  public message = '';
  public error = '';

  constructor(private newsletterService: NewsletterService) {}

  public subscribe(): void {
    if (!this.email.trim()) {
      this.error = 'Informe um email valido para continuar.';
      this.message = '';
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';

    this.newsletterService.subscribe({
      name: this.name.trim() || undefined,
      email: this.email.trim(),
    }).subscribe({
      next: () => {
        this.message = 'Inscricao realizada com sucesso. Fique de olho na sua caixa de entrada.';
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
