import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  searchTerm: string = '';

  constructor(private router: Router) {}

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/busca'], { queryParams: { q: this.searchTerm } });
    }
  }

  onSearchInput(): void {
    // Debounce simples: busque após 300ms sem digitar
    // Para live search, integre com serviço de posts
    console.log('Buscando:', this.searchTerm); // Aqui: chame serviço de notícias
  }

  onSubscribe(): void {
    // Lógica para newsletter
    console.log('Abrir modal assinatura');
  }
}
