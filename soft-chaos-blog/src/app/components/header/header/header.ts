import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  searchTerm = '';

  constructor(private router: Router) {}

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/busca'], { queryParams: { q: this.searchTerm } });
    }
  }

  onSearchInput(): void {
    return;
  }

  onSubscribe(): void {
    document.getElementById('newsletter-signup')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

