import { Pagination } from '../../components/shared/pagination/pagination';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { News } from '../../models/news';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { PublicArticleService } from '../../services/public-article-service';
import { LoadingIndicator } from '../../components/shared/loading-indicator/loading-indicator';
import { ProgressiveImage } from '../../components/shared/progressive-image/progressive-image';

@Component({
  selector: 'app-search-pages',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, LoadingIndicator, ProgressiveImage, Pagination],
  templateUrl: './search-pages.html',
  styleUrl: './search-pages.css',
})
export class SearchPages implements OnInit, OnDestroy {
  searchTerm: string = '';
  resultados: News[] = [];
  loading: boolean = false;
  error = '';
  page = 0;
  totalPages = 0;
  private request?: Subscription;
  private paramsSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private publicArticleService: PublicArticleService
  ) {}

  ngOnInit(): void {
    this.paramsSubscription = this.route.queryParams.subscribe(params => {
      this.request?.unsubscribe();
      this.searchTerm = params['q'] || '';
      this.page = 0;
      this.totalPages = 0;
      this.error = '';
      this.loading = false;

      if (this.searchTerm.trim()) {
        this.buscarNoticias();
      } else {
        this.resultados = [];
      }
    });
  }

  public buscarNoticias(page = 0): void {
    this.request?.unsubscribe();
    this.loading = true;
    this.error = '';

    this.request = this.publicArticleService.searchArticles(this.searchTerm, page).subscribe({
      next: (articles) => {
        this.resultados = articles.content;
        this.page = articles.pageNumber;
        this.totalPages = articles.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar noticias:', err);
        this.resultados = [];
        this.error = 'Nao foi possivel carregar os resultados da busca agora.';
        this.loading = false;
      }
    });
  }
  ngOnDestroy(): void {
    this.request?.unsubscribe();
    this.paramsSubscription?.unsubscribe();
  }
}
