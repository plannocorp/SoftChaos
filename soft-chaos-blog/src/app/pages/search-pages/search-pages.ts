import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { NewsService } from '../../services/news-service';
import { ArticleSummary } from '../../models/article-summary';

@Component({
  selector: 'app-search-pages',
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './search-pages.html',
  styleUrl: './search-pages.css',
})
export class SearchPages implements OnInit {
  searchTerm: string = '';
  resultados: ArticleSummary[] = [];
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService
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
    const termoNormalizado = this.normalizeString(this.searchTerm.toLowerCase().trim());

    this.newsService.getAll().subscribe({
      next: (todasNoticias) => {
        this.resultados = todasNoticias.filter(noticia => {
          const titleMatch = this.normalizeString(noticia.title.toLowerCase()).includes(termoNormalizado);
          const descMatch = noticia.subtitle ? this.normalizeString(noticia.subtitle.toLowerCase()).includes(termoNormalizado) : false;
          const categoryMatch = this.normalizeString(noticia.categoryName.toLowerCase()).includes(termoNormalizado);
          return titleMatch || descMatch || categoryMatch;
        });
        this.loading = false;
        console.log(`Busca por "${this.searchTerm}" encontrou ${this.resultados.length} resultados`);
      },
      error: (err) => {
        console.error('Erro ao carregar artigos para busca', err);
        this.resultados = [];
        this.loading = false;
      }
    });
  }

  private normalizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '');
  }
}
