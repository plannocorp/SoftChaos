import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private newsService: NewsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBastidoresNews();
  }

  public loadBastidoresNews(): void {
    this.newsService.getAll().subscribe({
      next: (allArticles) => {
        this.newsNovidades = allArticles.filter(
          article => article.categoryName?.toLowerCase() === 'bastidores'
        );
        console.log(`Bastidores: ${this.newsNovidades.length} artigos encontrados`);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar notícias de Bastidores', err);
        this.newsNovidades = [];
        this.cd.detectChanges();
      }
    });
  }
}
