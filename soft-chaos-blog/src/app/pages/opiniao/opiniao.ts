import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { RouterLink } from "@angular/router";
import { NewsService } from '../../services/news-service';
import { ArticleSummary } from '../../models/article-summary';

@Component({
  selector: 'app-opiniao',
  imports: [Header, Footer, RouterLink],
  templateUrl: './opiniao.html',
  styleUrl: './opiniao.css',
})
export class Opiniao implements OnInit {
  public newsOpiniao: ArticleSummary[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadOpiniaoNews();
  }

  public loadOpiniaoNews(): void {
    this.newsService.getAll().subscribe({
      next: (allArticles) => {
        // Filtra artigos cuja categoria seja "Opiniao" (case-insensitive)
        this.newsOpiniao = allArticles.filter(
          article => article.categoryName?.toLowerCase() === 'opiniao'
        );
        console.log(`Opinião: ${this.newsOpiniao.length} artigos encontrados`);
      },
      error: (err) => {
        console.error('Erro ao carregar notícias de Opinião', err);
        this.newsOpiniao = [];
      }
    });
  }
}
