import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { NewsService } from '../../services/news-service';
import { ArticleSummary } from '../../models/article-summary';
import { PagedResponse } from '../../models/paged-response';

@Component({
  selector: 'app-explorar-chaos-page',
  imports: [Header, Footer, RouterLink, CommonModule],
  templateUrl: './explorar-chaos-page.html',
  styleUrl: './explorar-chaos-page.css',
})
export class ExplorarChaosPage implements OnInit {
  public existentNews: ArticleSummary[] = [];
  public currentPage: number = 0;
  public pageSize: number = 9;      // 9 itens por página (3x3 grid)
  public totalPages: number = 0;
  public totalElements: number = 0;
  public loading: boolean = false;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadNews(this.currentPage);
  }

  public loadNews(page: number): void {
    this.loading = true;
    this.newsService.getArticlesPaginated(page, this.pageSize).subscribe({
      next: (response: PagedResponse<ArticleSummary>) => {
        this.existentNews = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.currentPage = response.pageNumber;
        this.loading = false;
        // Rolar para o topo da página
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        console.error('Erro ao carregar notícias paginadas', err);
        this.existentNews = [];
        this.loading = false;
      }
    });
  }

  public nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.loadNews(this.currentPage + 1);
    }
  }

  public prevPage(): void {
    if (this.currentPage > 0) {
      this.loadNews(this.currentPage - 1);
    }
  }

  public goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.loadNews(page);
    }
  }

  public getPagesArray(): number[] {
    // Exibe até 5 páginas ao redor da atual
    const range = 2;
    const start = Math.max(0, this.currentPage - range);
    const end = Math.min(this.totalPages - 1, this.currentPage + range);
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
