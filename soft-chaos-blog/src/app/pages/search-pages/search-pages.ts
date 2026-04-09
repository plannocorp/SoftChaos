import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { News } from '../../models/news';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { PublicArticleService } from '../../services/public-article-service';

@Component({
  selector: 'app-search-pages',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './search-pages.html',
  styleUrl: './search-pages.css',
})
export class SearchPages implements OnInit {
  searchTerm: string = '';
  resultados: News[] = [];
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private publicArticleService: PublicArticleService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || '';

      if (this.searchTerm.trim()) {
        this.buscarNoticias();
      } else {
        this.resultados = [];
      }
    });
  }

  private buscarNoticias(): void {
    this.loading = true;

    this.publicArticleService.searchArticles(this.searchTerm).subscribe({
      next: (articles) => {
        this.resultados = articles;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar noticias:', err);
        this.resultados = [];
        this.loading = false;
      }
    });
  }
}
