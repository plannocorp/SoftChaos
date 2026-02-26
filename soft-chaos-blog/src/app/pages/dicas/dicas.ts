import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { NewsService } from '../../services/news-service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-dicas',
  imports: [Header, Footer, RouterLink],
  templateUrl: './dicas.html',
  styleUrl: './dicas.css',
})
export class Dicas implements OnInit {
  public newsDicas: News[] | undefined;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadDicasNews();
  }

  public loadDicasNews(): void {
    this.newsDicas = this.newsService.getByType('DICAS');
  }
}
