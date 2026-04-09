const configuredApiBaseUrl = ((import.meta as any).env?.['VITE_API_BASE_URL'] as string | undefined)?.trim();

function normalizeBaseUrl(baseUrl?: string): string {
  if (!baseUrl) {
    return '';
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

export const appEnvironment = {
  apiBaseUrl: normalizeBaseUrl(configuredApiBaseUrl),
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
