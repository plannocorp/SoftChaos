import { Pagination } from '../../components/shared/pagination/pagination';
import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../services/public-article-service';
import { LoadingIndicator } from '../../components/shared/loading-indicator/loading-indicator';
import { ProgressiveImage } from '../../components/shared/progressive-image/progressive-image';

@Component({
  selector: 'app-tendencias',
  imports: [Header, Footer, RouterLink, LoadingIndicator, ProgressiveImage, Pagination],
  templateUrl: './tendencias.html',
  styleUrl: './tendencias.css',
})
export class Tendencias implements OnInit {
  public newsTendencias: News[] | undefined;
  public loading = true;
  public error = '';
  public page = 0;
  public totalPages = 0;

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadTendenciasNews();
  }

  public loadTendenciasNews(page = 0): void {
    this.loading = true;
    this.error = '';

    this.publicArticleService.getArticlesByCategorySlug('tendencias', page).subscribe({
      next: (articles) => {
        this.newsTendencias = articles.content;
        this.page = articles.pageNumber;
        this.totalPages = articles.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias de tendencias:', err);
        this.newsTendencias = [];
        this.error = 'Nao foi possivel carregar as noticias de tendencias agora.';
        this.loading = false;
      }
    });
  }
}
