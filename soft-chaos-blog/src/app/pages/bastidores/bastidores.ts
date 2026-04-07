import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { RouterLink } from "@angular/router";
import { NewsService } from '../../services/news-service';
import { ArticleSummary } from '../../models/article-summary';

@Component({
  selector: 'app-bastidores',
  imports: [Header, Footer, RouterLink],
  templateUrl: './bastidores.html',
  styleUrl: './bastidores.css',
})
export class Bastidores implements OnInit {
  public newsBastidores: ArticleSummary[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadBastidoresNews();
  }

  public loadBastidoresNews(): void {
    this.newsService.getAll().subscribe({
      next: (allArticles) => {
        // Filtra artigos cuja categoria seja "Bastidores" (case-insensitive)
        this.newsBastidores = allArticles.filter(
          article => article.categoryName?.toLowerCase() === 'bastidores'
        );
        console.log(`Bastidores: ${this.newsBastidores.length} artigos encontrados`);
      },
      error: (err) => {
        console.error('Erro ao carregar notícias de Bastidores', err);
        this.newsBastidores = [];
      }
    });
  }
}
