import { Pagination } from '../../components/shared/pagination/pagination';
import { Component, OnInit } from '@angular/core';
import { News } from '../../models/news';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../services/public-article-service';
import { LoadingIndicator } from '../../components/shared/loading-indicator/loading-indicator';
import { ProgressiveImage } from '../../components/shared/progressive-image/progressive-image';

@Component({
  selector: 'app-explorar-chaos-page',
  imports: [Header, Footer, RouterLink, LoadingIndicator, ProgressiveImage, Pagination],
  templateUrl: './explorar-chaos-page.html',
  styleUrl: './explorar-chaos-page.css',
})
export class ExplorarChaosPage implements OnInit {
  public existentNews: News[] | undefined;
  public loading = true;
  public error = '';
  public page = 0;
  public totalPages = 0;

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadAllNews();
  }

  public loadAllNews(page = 0): void {
    this.loading = true;
    this.error = '';

    this.publicArticleService.getPublishedArticles(page).subscribe({
      next: (articles) => {
        this.existentNews = articles.content;
        this.page = articles.pageNumber;
        this.totalPages = articles.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias da exploracao:', err);
        this.existentNews = [];
        this.error = 'Nao foi possivel carregar as noticias publicadas agora.';
        this.loading = false;
      }
    });
  }
}
