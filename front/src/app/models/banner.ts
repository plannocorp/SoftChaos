export interface BannerItem {
  id: number;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  targetUrl?: string;
  imageUrl: string;
  imageAltText?: string;
  displayOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
