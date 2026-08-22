import { SheetApiResponse, ExtractedContentResponse } from '../types/content';

/**
 * Fetch Google Sheet content or sample fallback library
 */
export async function fetchSheetData(sheetUrl?: string, apiKey?: string): Promise<SheetApiResponse> {
  const params = new URLSearchParams();
  if (sheetUrl) params.append('url', sheetUrl);
  if (apiKey) params.append('apiKey', apiKey);

  const response = await fetch(`/api/sheet?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to load content from server (${response.status})`);
  }
  return response.json();
}

/**
 * Fetch extracted webpage article content for details page
 */
export async function fetchExtractedContent(targetUrl: string): Promise<ExtractedContentResponse> {
  const params = new URLSearchParams({ url: targetUrl });
  const response = await fetch(`/api/extract-content?${params.toString()}`);
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
    const response = await fetch('/api/clear-cache', { method: 'POST' });
    return response.ok;
  } catch (e) {
    return false;
  }
}
