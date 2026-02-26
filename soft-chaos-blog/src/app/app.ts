import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header/header";
import { FeaturedNews } from "./components/main/featured-news/featured-news";
import { Explorer } from "./components/main/explorer/explorer";
import { Footer } from "./components/footer/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, FeaturedNews, Explorer, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('soft-chaos-blog');
}
