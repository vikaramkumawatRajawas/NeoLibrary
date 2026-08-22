import { SheetApiResponse, ExtractedContentResponse } from '../types/content';

/**
 * Centralized Production API Base URL Resolver
 * Resolves VITE_API_URL environment variable or defaults to same-origin /api.
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    let cleanUrl = envUrl.trim().replace(/\/+$/, '');
    if (cleanUrl.endsWith('/api')) {
      cleanUrl = cleanUrl.replace(/\/api$/, '');
    }
    return cleanUrl;
  }
  return '';
}

/**
 * Fetch Google Sheet content or fallback library
 */
export async function fetchSheetData(sheetUrl?: string, apiKey?: string): Promise<SheetApiResponse> {
  const params = new URLSearchParams();
  if (sheetUrl) params.append('url', sheetUrl);
  if (apiKey) params.append('apiKey', apiKey);

  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/sheet?${params.toString()}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let errorMessage = `Failed to load content from server (${response.status})`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error) errorMessage = parsed.error;
    } catch (e) {}
    throw new Error(errorMessage);
  }
  return response.json();
}

/**
 * Fetch extracted webpage article content for details page
 */
export async function fetchExtractedContent(targetUrl: string): Promise<ExtractedContentResponse> {
  const params = new URLSearchParams({ url: targetUrl });
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/extract-content?${params.toString()}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    return {
      success: false,
      url: targetUrl,
      error: `Server responded with error status ${response.status}`,
    };
  }
  return response.json();
}

/**
 * Clear server-side cache
 */
export async function clearServerCache(): Promise<boolean> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/clear-cache`, { method: 'POST' });
    return response.ok;
  } catch (e) {
    return false;
  }
}
