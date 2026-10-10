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
  selector: 'app-dicas',
  imports: [Header, Footer, RouterLink, LoadingIndicator, ProgressiveImage, Pagination],
  templateUrl: './dicas.html',
  styleUrl: './dicas.css',
})
export class Dicas implements OnInit {
  public newsDicas: News[] | undefined;
  public loading = true;
  public error = '';
  public page = 0;
  public totalPages = 0;

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadDicasNews();
  }

  public loadDicasNews(page = 0): void {
    this.loading = true;
    this.error = '';

    this.publicArticleService.getArticlesByCategorySlug('dicas', page).subscribe({
      next: (articles) => {
        this.newsDicas = articles.content;
        this.page = articles.pageNumber;
        this.totalPages = articles.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias de dicas:', err);
        this.newsDicas = [];
        this.error = 'Nao foi possivel carregar as noticias de dicas agora.';
        this.loading = false;
      }
    });
  }
}
