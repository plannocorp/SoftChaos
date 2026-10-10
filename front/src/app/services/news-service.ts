import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiEnvelope } from '../models/news';
import { Category } from '../models/category';

@Injectable({ providedIn: 'root' })
export class NewsService {
  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<ApiEnvelope<Category[]>>('/api/categories').pipe(
      map((response) => response.data)
    );
  }
}
