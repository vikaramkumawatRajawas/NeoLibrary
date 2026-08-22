import { ContentItem } from '../types/content';

/**
 * Get Canonical Share URL for current item/page
 */
export function getShareUrl(item?: ContentItem): string {
  if (typeof window === 'undefined') return '';
  
  const envAppUrl = (import.meta as any).env?.VITE_APP_URL;
  const baseUrl = envAppUrl || window.location.origin;
  
  if (item) {
    const searchParams = new URLSearchParams();
    searchParams.set('article', item.id);
    if (item.url) searchParams.set('source', encodeURIComponent(item.url));
    return `${baseUrl}/?${searchParams.toString()}`;
  }

  return window.location.href;
}

/**
 * Formats WhatsApp Share Link
 */
export function getWhatsAppShareUrl(title: string, pageUrl: string): string {
  const text = `Check out this article: "${title}"\n${pageUrl}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Formats Facebook Share Link
 */
export function getFacebookShareUrl(pageUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
}

/**
 * Formats X / Twitter Share Link
 */
export function getXShareUrl(title: string, pageUrl: string): string {
  const text = `Check out this article: "${title}"`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`;
}

/**
 * Formats Telegram Share Link
 */
export function getTelegramShareUrl(title: string, pageUrl: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`;
}

/**
 * Native Web Share API helper
 */
export async function nativeShare(title: string, text: string, url: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
}

/**
 * Clipboard Copy helper with fallback
 */
export async function copyPageUrl(url: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (err) {
      // Fallback
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    return false;
  }
}

/**
 * Dynamically updates social sharing metadata (OG / Twitter tags)
 */
export function updateSocialMetaTags(item: ContentItem) {
  if (typeof document === 'undefined') return;

  const shareUrl = getShareUrl(item);

  // Update Page Title
  document.title = `${item.title} | NeoLibrary`;

  const setMetaTag = (selector: string, attr: string, value: string) => {
    let tag = document.querySelector(selector);
    if (!tag) {
      tag = document.createElement('meta');
      if (selector.startsWith('meta[name=')) {
        const name = selector.match(/name="([^"]+)"/)?.[1];
        if (name) tag.setAttribute('name', name);
      } else if (selector.startsWith('meta[property=')) {
        const prop = selector.match(/property="([^"]+)"/)?.[1];
        if (prop) tag.setAttribute('property', prop);
      }
      document.head.appendChild(tag);
    }
    tag.setAttribute(attr, value);
  };

  setMetaTag('meta[name="description"]', 'content', item.content || item.title);
  setMetaTag('meta[property="og:title"]', 'content', item.title);
  setMetaTag('meta[property="og:description"]', 'content', item.content || item.title);
  setMetaTag('meta[property="og:image"]', 'content', item.image || '');
  setMetaTag('meta[property="og:url"]', 'content', shareUrl);
  setMetaTag('meta[property="og:type"]', 'content', 'article');
  setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'content', item.title);
  setMetaTag('meta[name="twitter:description"]', 'content', item.content || item.title);
  setMetaTag('meta[name="twitter:image"]', 'content', item.image || '');
}
