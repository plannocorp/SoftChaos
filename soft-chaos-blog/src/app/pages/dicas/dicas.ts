import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { RouterLink } from "@angular/router";
import { NewsService } from '../../services/news-service';
import { ArticleSummary } from '../../models/article-summary';

@Component({
  selector: 'app-dicas',
  imports: [Header, Footer, RouterLink],
  templateUrl: './dicas.html',
  styleUrl: './dicas.css',
})
export class Dicas implements OnInit {
  public newsDicas: ArticleSummary[] = [];

  constructor(
    private newsService: NewsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDicasNews();
  }

  public loadDicasNews(): void {
    this.newsService.getAll().subscribe({
      next: (allArticles) => {
        this.newsDicas = allArticles.filter(
          article => article.categoryName?.toLowerCase() === 'dicas'
        );
        console.log(`Dicas : ${this.newsDicas.length} artigos encontrados`);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar notícias de Bastidores', err);
        this.newsDicas = [];
        this.cd.detectChanges();
      }
    });
  }
}
