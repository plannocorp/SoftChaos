import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { RouterLink } from "@angular/router";
import { NewsService } from '../../services/news-service';
import { ArticleSummary } from '../../models/article-summary';

@Component({
  selector: 'app-tendencias',
  imports: [Header, Footer, RouterLink],
  templateUrl: './tendencias.html',
  styleUrl: './tendencias.css',
})
export class Tendencias implements OnInit {
  public newsTendencias: ArticleSummary[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadTendenciasNews();
  }

  public loadTendenciasNews(): void {
    this.newsService.getAll().subscribe({
      next: (allArticles) => {
        // Filtra artigos cuja categoria seja "Tendencias" (sem acento, case-insensitive)
        this.newsTendencias = allArticles.filter(
          article => article.categoryName?.toLowerCase() === 'tendencias'
        );
        console.log(`Tendências: ${this.newsTendencias.length} artigos encontrados`);
      },
      error: (err) => {
        console.error('Erro ao carregar notícias de Tendências', err);
        this.newsTendencias = [];
      }
    });
  }
}
