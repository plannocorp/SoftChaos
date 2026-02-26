import { Component, OnInit } from '@angular/core';
import { News } from '../../models/news';
import { NewsService } from '../../services/news-service';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-explorar-chaos-page',
  imports: [Header, Footer, RouterLink],
  templateUrl: './explorar-chaos-page.html',
  styleUrl: './explorar-chaos-page.css',
})
export class ExplorarChaosPage implements OnInit {
  public existentNews: News[] | undefined;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadAllNews();
  }

  public loadAllNews(): void {
    this.existentNews = this.newsService.getAll();
  }
}
