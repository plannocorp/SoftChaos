import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class NewsletterPage implements OnInit {
  public name = '';
  public email = '';
  public loading = false;
  public message = '';
  public error = '';

  constructor(private newsletterService: NewsletterService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    if (!this.route.snapshot.data['confirmation']) return;
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.error = 'Link de confirmação inválido.';
      return;
    }
    this.loading = true;
    this.newsletterService.confirm(token).subscribe({
      next: (response) => { this.message = response.message || 'Inscrição confirmada com sucesso!'; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Não foi possível confirmar sua inscrição.'; this.loading = false; },
    });
  }

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
      next: (response) => {
        this.message = response.message || 'Inscrição realizada com sucesso!';
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
