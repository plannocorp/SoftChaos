import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface NewsletterSubscriptionPayload {
  email: string;
  name?: string;
}

export interface NewsletterSubscriptionResponse {
  id: number;
  email: string;
  name?: string;
  active?: boolean;
  confirmed?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  constructor(private http: HttpClient) {}

  subscribe(payload: NewsletterSubscriptionPayload): Observable<ApiEnvelope<NewsletterSubscriptionResponse>> {
    return this.http.post<ApiEnvelope<NewsletterSubscriptionResponse>>('/api/newsletter/subscribe', payload);
  }
}
