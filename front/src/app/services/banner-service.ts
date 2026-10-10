import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEnvelope } from '../models/news';
import { BannerItem } from '../models/banner';
import { buildApiUrl, buildAssetUrl } from '../config/app-environment';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private readonly apiUrl = buildApiUrl('/api/banners');

  constructor(private http: HttpClient) {}

  getPublicBanners(): Observable<BannerItem[]> {
    return this.http.get<ApiEnvelope<BannerItem[]>>(`${this.apiUrl}/active`).pipe(
      timeout({ first: 5000 }),
      map((response) => (response.data ?? []).map((banner) => ({ ...banner, imageUrl: buildAssetUrl(banner.imageUrl) || banner.imageUrl })))
    );
  }

  getAdminBanners(): Observable<BannerItem[]> {
    return this.http.get<ApiEnvelope<BannerItem[]>>(`${this.apiUrl}/admin`).pipe(
      map((response) => (response.data ?? []).map((banner) => ({ ...banner, imageUrl: buildAssetUrl(banner.imageUrl) || banner.imageUrl })))
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
