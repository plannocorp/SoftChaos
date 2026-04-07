import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { RouterLink } from "@angular/router";
import { NewsService } from '../../services/news-service';
import { ArticleSummary } from '../../models/article-summary';

@Component({
  selector: 'app-novidades',
  imports: [Header, Footer, RouterLink],
  templateUrl: './novidades.html',
  styleUrl: './novidades.css',
})
export class Novidades implements OnInit {
  public newsNovidades: ArticleSummary[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadNovidadeNews();
  }

  public loadNovidadeNews(): void {
    this.newsService.getAll().subscribe({
      next: (allArticles) => {
        // Filtra artigos cuja categoria seja "Novidades" (case-insensitive)
        this.newsNovidades = allArticles.filter(
          article => article.categoryName?.toLowerCase() === 'novidades'
        );
        console.log(`Novidades: ${this.newsNovidades.length} artigos encontrados`);
      },
      error: (err) => {
        console.error('Erro ao carregar notícias de Novidades', err);
        this.newsNovidades = [];
      }
    });
  }
}
