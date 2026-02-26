import { Component, OnInit } from '@angular/core';
import { News } from '../../../models/news';
import { NewsService } from '../../../services/news-service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-explorer',
  imports: [RouterLink],
  templateUrl: './explorer.html',
  styleUrl: './explorer.css',
})
export class Explorer implements OnInit {
  public firstCardNews: News | undefined;
  public secCardNews: News | undefined;
  public thirdCardNews: News | undefined;
  
  constructor(private newsService: NewsService) {} // Injeção de dependência

  ngOnInit() {
    this.loadCardNews();
  }

  public loadCardNews(): void {
    const cardNews = this.newsService.getCardNews();

    this.firstCardNews = cardNews[0];
    this.secCardNews = cardNews[1];
    this.thirdCardNews = cardNews[2];

    console.log(this.firstCardNews, this.secCardNews, this.thirdCardNews);
  }
}
