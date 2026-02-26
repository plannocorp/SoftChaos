import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { NewsService } from '../../services/news-service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-opiniao',
  imports: [Header, Footer, RouterLink],
  templateUrl: './opiniao.html',
  styleUrl: './opiniao.css',
})
export class Opiniao implements OnInit {
  public newsOpiniao: News[] | undefined;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadOpiniaoNews();
  }

  public loadOpiniaoNews(): void {
    this.newsOpiniao = this.newsService.getByType('OPINIÃO');
  }
}
