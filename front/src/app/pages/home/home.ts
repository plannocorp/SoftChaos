import { Component } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { FeaturedNews } from "../../components/main/featured-news/featured-news";
import { Explorer } from "../../components/main/explorer/explorer";
import { Footer } from "../../components/footer/footer/footer";
import { BannerCarousel } from "../../components/main/banner-carousel/banner-carousel";

@Component({
  selector: 'app-home',
  imports: [Header, BannerCarousel, FeaturedNews, Explorer, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
