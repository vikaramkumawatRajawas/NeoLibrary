import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';
import { getCache, setCache } from './cacheService.js';
import { sanitizeArticleHtml } from '../utils/sanitizeHtml.js';
import { getDomainFromUrl, isValidUrl } from '../utils/urlParser.js';
import { 
  extractAllElementImageCandidates, 
  isUsableImage, 
  normalizeImageUrl, 
  parseSrcset 
} from '../utils/imageResolver.js';

/**
 * Phase 2, 3, 4, 8 & 14 — Production-Grade Article & Image Extraction Service
 */
export async function extractContentFromUrl(targetUrl) {
  if (!isValidUrl(targetUrl)) {
    return {
      success: false,
      error: 'Invalid or missing target URL format.',
      url: targetUrl || '',
      domain: getDomainFromUrl(targetUrl),
    };
  }

  // Phase 13: Cache version v2
  const cacheKey = `url_content_v2_${targetUrl}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const domain = getDomainFromUrl(targetUrl);

  try {
    const response = await axios.get(targetUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      maxRedirects: 5,
    });

    const htmlContent = response.data;
    if (typeof htmlContent !== 'string' || htmlContent.length < 50) {
      return {
        success: false,
        error: 'Unable to preview this content. The webpage returned empty or non-HTML data.',
        url: targetUrl,
        domain,
      };
    }

    const $ = cheerio.load(htmlContent);

    // Phase 2: Priority Extraction for Hero Image (og:image -> twitter:image -> article lead photo)
    let rawHeroCandidate = $('meta[property="og:image"]').attr('content') || 
                           $('meta[property="og:image:secure_url"]').attr('content') || 
                           $('meta[name="twitter:image"]').attr('content') || 
                           $('meta[name="twitter:image:src"]').attr('content') || 
                           $('.article-picture img').first().attr('src') || 
                           $('article img').first().attr('src') || '';

    let heroImageUrl = normalizeImageUrl(rawHeroCandidate, targetUrl);

    // Phase 3 & 4: Extract all article content images with srcset & lazy attributes
    const contentImages = [];
    $('article img, .articlebodycontent img, figure img, .main-content img').each((_, el) => {
      const candidates = extractAllElementImageCandidates(el, $, targetUrl);
      if (candidates.length > 0) {
        const bestUrl = candidates[0]; // Candidate sorted by highest width
        if (isUsableImage(bestUrl) && !contentImages.some(img => img.url === bestUrl)) {
          const alt = $(el).attr('alt') || $(el).attr('title') || '';
          const caption = $(el).closest('figure').find('figcaption').text().trim() || 
                          $(el).next('.caption').text().trim() || alt;
          contentImages.push({ url: bestUrl, alt, caption, source: 'article' });
        }
      }
    });

    // If heroImageUrl is not set, use the first valid content image
    if (!heroImageUrl && contentImages.length > 0) {
      heroImageUrl = contentImages[0].url;
    }

    const heroImageObj = heroImageUrl ? {
      url: heroImageUrl,
      source: $('meta[property="og:image"]').attr('content') ? 'og:image' : 'article',
      alt: $('title').text().trim(),
      caption: $('meta[name="description"]').attr('content') || ''
    } : null;

    // Phase 8: Construct consistent allImages list starting with hero image
    const allImages = [];
    if (heroImageObj) {
      allImages.push({ src: heroImageObj.url, alt: heroImageObj.alt, caption: heroImageObj.caption });
    }
    for (const img of contentImages) {
      if (!allImages.some(a => a.src === img.url)) {
        allImages.push({ src: img.url, alt: img.alt, caption: img.caption });
      }
    }

    // Readability parsing
    const dom = new JSDOM(htmlContent, { url: targetUrl });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article && article.content && article.content.trim().length > 100) {
      // Phase 7: Resolve image sources in article body HTML while preserving responsive srcset attributes & aspect ratio
      const $content = cheerio.load(article.content, null, false);
      $content('img').each((_, el) => {
        const candidates = extractAllElementImageCandidates(el, $content, targetUrl);
        if (candidates.length > 0) {
          const bestUrl = candidates[0];
          $content(el).attr('src', bestUrl);
          $content(el).removeAttr('data-src');
          $content(el).removeAttr('data-lazy-src');
          $content(el).removeAttr('data-original');
          $content(el).attr('loading', 'lazy');
          $content(el).attr('decoding', 'async');
          $content(el).addClass('rounded-2xl my-6 mx-auto shadow-glass-md max-w-full h-auto cursor-pointer border border-white/10 object-contain');
        }
      });

      const processedHtml = $content.html();
      const sanitizedContent = sanitizeArticleHtml(processedHtml);
      const textContent = article.textContent || '';
      const wordCount = textContent.trim().split(/\s+/).length;
      const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

      const result = {
        success: true,
        title: article.title || $('title').text() || 'Extracted Article',
        author: article.byline || $('meta[name="author"]').attr('content') || domain,
        date: article.publishedTime || $('meta[property="article:published_time"]').attr('content') || new Date().toISOString().split('T')[0],
        excerpt: article.excerpt || article.textContent.slice(0, 280) + '...',
        contentHtml: sanitizedContent,
        leadImage: heroImageUrl,
        heroImage: heroImageObj,
        contentImages,
        allImages,
        domain,
        url: targetUrl,
        readingTime: `${readingTimeMinutes} min read`,
        wordCount,
        extractedAt: new Date().toISOString(),
      };

      setCache(cacheKey, result, 86400); // 24 hour cache
      return result;
    }

    // Fallback Cheerio extraction
    $('script, style, nav, footer, iframe, noscript, .ad, .advertisement').remove();
    const title = $('h1').first().text().trim() || $('title').text().trim() || domain;
    const bodyParagraphs = [];
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 30) {
        bodyParagraphs.push(`<p>${$(el).html()}</p>`);
      }
    });

    if (bodyParagraphs.length > 0) {
      const rawHtml = bodyParagraphs.join('\n');
      const sanitizedContent = sanitizeArticleHtml(rawHtml);
      const plainText = bodyParagraphs.map(p => p.replace(/<[^>]*>?/gm, '')).join(' ');
      const wordCount = plainText.trim().split(/\s+/).length;

      const result = {
        success: true,
        title,
        author: domain,
        date: new Date().toISOString().split('T')[0],
        excerpt: plainText.slice(0, 250) + '...',
        contentHtml: sanitizedContent,
        leadImage: heroImageUrl,
        heroImage: heroImageObj,
        contentImages,
        allImages,
        domain,
        url: targetUrl,
        readingTime: `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
        wordCount,
        extractedAt: new Date().toISOString(),
      };

      setCache(cacheKey, result, 86400);
      return result;
    }

    return {
      success: false,
      error: 'Unable to preview this content. Main text body could not be extracted automatically.',
      url: targetUrl,
      domain,
    };
  } catch (err) {
    console.warn(`[Content Extractor Error] for ${targetUrl}: ${err.message}`);
    return {
      success: false,
      error: 'Unable to preview this content. Target website blocked server-side extraction or timed out.',
      url: targetUrl,
      domain,
    };
  }
}
