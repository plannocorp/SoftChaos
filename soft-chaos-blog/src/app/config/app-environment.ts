const configuredApiBaseUrl = ((import.meta as any).env?.['VITE_API_BASE_URL'] as string | undefined)?.trim();
const defaultProductionApiBaseUrl = 'https://softchaos-backend.onrender.com';

function normalizeBaseUrl(baseUrl?: string): string {
  if (!baseUrl) {
    return '';
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function resolveApiBaseUrl(): string {
  if (configuredApiBaseUrl) {
    return normalizeBaseUrl(configuredApiBaseUrl);
  }

  if (typeof window === 'undefined') {
    return normalizeBaseUrl(defaultProductionApiBaseUrl);
  }

  const { hostname } = window.location;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalhost) {
    return '';
  }

  return normalizeBaseUrl(defaultProductionApiBaseUrl);
}

export const appEnvironment = {
  apiBaseUrl: resolveApiBaseUrl(),
};

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return appEnvironment.apiBaseUrl ? `${appEnvironment.apiBaseUrl}${normalizedPath}` : normalizedPath;
}

export function buildAssetUrl(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return buildApiUrl(url);
}
