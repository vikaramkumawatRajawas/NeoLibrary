/**
 * Extracts a clean display domain name from a URL string
 * e.g., "https://www.example.com/article/123" -> "example.com"
 */
export function getDomainFromUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return '';
  try {
    const formatted = urlString.startsWith('http://') || urlString.startsWith('https://')
      ? urlString
      : `https://${urlString}`;
    const parsed = new URL(formatted);
    return parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    return urlString;
  }
}

/**
 * Gets high quality favicon URL for a domain
 */
export function getFaviconUrl(urlString) {
  const domain = getDomainFromUrl(urlString);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

/**
 * Validates if a string is a valid HTTP/HTTPS URL
 */
export function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}
