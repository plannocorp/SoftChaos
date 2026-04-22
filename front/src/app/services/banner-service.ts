import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEnvelope } from '../models/news';
import { BannerItem } from '../models/banner';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private readonly apiUrl = '/api/banners';

  constructor(private http: HttpClient) {}

  getPublicBanners(): Observable<BannerItem[]> {
    return this.http.get<ApiEnvelope<BannerItem[]>>(`${this.apiUrl}/active`).pipe(
      map((response) => response.data ?? [])
    );
  }

  getAdminBanners(): Observable<BannerItem[]> {
    return this.http.get<ApiEnvelope<BannerItem[]>>(`${this.apiUrl}/admin`).pipe(
      map((response) => response.data ?? [])
    );
  }

  createBanner(payload: FormData): Observable<BannerItem> {
    return this.http.post<ApiEnvelope<BannerItem>>(this.apiUrl, payload).pipe(
      map((response) => response.data)
    );
  }

  updateBanner(id: number, payload: FormData): Observable<BannerItem> {
    return this.http.put<ApiEnvelope<BannerItem>>(`${this.apiUrl}/${id}`, payload).pipe(
      map((response) => response.data)
    );
  }

  deleteBanner(id: number): Observable<void> {
    return this.http.delete<ApiEnvelope<void>>(`${this.apiUrl}/${id}`).pipe(
      map(() => void 0)
    );
  }
}
