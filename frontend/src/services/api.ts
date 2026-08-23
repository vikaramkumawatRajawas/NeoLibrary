import { SheetApiResponse, ExtractedContentResponse } from '../types/content';

/**
 * Centralized Production API Base URL Resolver
 * Resolves VITE_API_URL environment variable or defaults to same-origin /api.
 */
export function getApiBaseUrl(): string {
  const rawEnv = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_APP_URL;
  if (rawEnv && typeof rawEnv === 'string') {
    const trimmed = rawEnv.trim();
    if (trimmed.length > 0 && trimmed !== 'undefined' && trimmed !== 'null' && trimmed !== '[object Object]') {
      let cleanUrl = trimmed.replace(/\/+$/, '');
      if (cleanUrl.endsWith('/api')) {
        cleanUrl = cleanUrl.slice(0, -4);
      }
      return cleanUrl;
    }
  }
  return '';
}

/**
 * Fetch Google Sheet content or fallback library
 */
export async function fetchSheetData(sheetUrl?: string, apiKey?: string): Promise<SheetApiResponse> {
  const params = new URLSearchParams();
  if (sheetUrl && sheetUrl.trim().length > 0) params.append('url', sheetUrl.trim());
  if (apiKey && apiKey.trim().length > 0) params.append('apiKey', apiKey.trim());

  const baseUrl = getApiBaseUrl();
  const queryString = params.toString();
  const endpoint = `${baseUrl}/api/sheet${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let errorMessage = 'Unable to load articles. Please try again.';
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error) errorMessage = parsed.error;
    } catch (e) {}
    throw new Error(errorMessage);
  }
  
  const data: SheetApiResponse = await response.json();
  if (data && data.success === false) {
    throw new Error(data.error || 'Unable to load articles. Please try again.');
  }
  return data;
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
