import axios from 'axios';
import { getCache, setCache } from './cacheService.js';
import { isValidUrl } from '../utils/urlParser.js';
import { getUniqueFallbackImage, isUsableImage } from '../utils/imageResolver.js';

const usedFallbackSet = new Set();
const DEFAULT_THE_HINDU_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1KDVGSCjW9CU7-4HLi0hpXotlG8F8yVRIla0Pnw2cdTg/edit?usp=sharing';
const DEFAULT_THE_HINDU_SHEET_ID = '1KDVGSCjW9CU7-4HLi0hpXotlG8F8yVRIla0Pnw2cdTg';

export function extractSheetId(sheetInput) {
  if (!sheetInput) return '';
  const match = sheetInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : sheetInput.trim();
}

/**
 * Mask Spreadsheet ID for secure server logs
 */
function maskSheetId(id) {
  if (!id || id.length < 8) return '****';
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

/**
 * Normalize Spreadsheet Rows
 */
export function normalizeSheetRow(rowObj, index) {
  if (!rowObj || typeof rowObj !== 'object') return null;

  const keys = Object.keys(rowObj);

  const findValue = (patterns) => {
    for (const key of keys) {
      const normalizedKey = key.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
      if (patterns.some(p => normalizedKey.includes(p))) {
        const val = rowObj[key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
    return '';
  };

  const rawTitle = findValue(['title', 'name', 'headline', 'topic', 'article', 'heading']);
  const author = findValue(['author', 'by', 'creator', 'writer', 'byline', 'source']);
  const rawUrl = findValue(['url', 'link', 'website', 'sourceurl', 'articleurl', 'href']);
  const content = findValue(['content', 'description', 'summary', 'excerpt', 'text', 'abstract', 'details', 'body']);
  let category = findValue(['category', 'type', 'tag', 'topic', 'section', 'genre']);
  const date = findValue(['date', 'published', 'timestamp', 'created', 'time']);

  const sheetImage = findValue(['image', 'image_url', 'imageurl', 'thumbnail', 'thumbnail_url', 'cover', 'cover_image', 'featured_image', 'photo']);

  // Check if this is an empty spreadsheet row
  if (!rawTitle && !rawUrl && !author && !content) {
    return null;
  }

  const title = rawTitle || `Article #${index + 1}`;
  const url = isValidUrl(rawUrl) ? rawUrl : (rawUrl ? `https://${rawUrl}` : '');

  // Auto-infer category from URL structure if missing
  if (!category && url) {
    try {
      const pathParts = new URL(url).pathname.split('/').filter(p => p && !p.endsWith('.ece') && !p.startsWith('article'));
      if (pathParts.length >= 2) {
        category = pathParts.slice(0, 2).map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ')).join(' • ');
      } else if (pathParts.length === 1) {
        category = pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1).replace(/-/g, ' ');
      }
    } catch (e) {}
  }
  if (!category) category = 'News & Feature';

  let image = '';
  let imageSource = 'fallback';

  if (sheetImage && isValidUrl(sheetImage) && isUsableImage(sheetImage)) {
    image = sheetImage;
    imageSource = 'sheet';
  } else {
    image = getUniqueFallbackImage(title, category, index, usedFallbackSet);
    imageSource = 'fallback';
  }

  return {
    id: `item-${index}-${Date.now().toString(36)}`,
    title,
    author: author || 'The Hindu Editorial',
    url,
    content: content || `Click to read full article from ${url ? new URL(url).hostname : 'source'}.`,
    category,
    date: date || new Date().toISOString().split('T')[0],
    image,
    imageSource,
  };
}

/**
 * Robust RFC 4180 compliant CSV Parser
 */
function parseCsvToObjects(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  const trimmedText = csvText.trim();
  if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.includes('<html') || trimmedText.includes('ServiceLogin')) {
    throw new Error('Spreadsheet is not publicly viewable. Please share with "Anyone with the link → Viewer".');
  }

  const parseCsvLines = (text) => {
    const rows = [];
    let curRow = [];
    let curVal = '';
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          curVal += '"';
          i += 2;
          continue;
        } else if (char === '"') {
          inQuotes = false;
          i++;
          continue;
        } else {
          curVal += char;
          i++;
          continue;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
          i++;
          continue;
        } else if (char === ',') {
          curRow.push(curVal.trim());
          curVal = '';
          i++;
          continue;
        } else if (char === '\r') {
          if (nextChar === '\n') i++;
          curRow.push(curVal.trim());
          rows.push(curRow);
          curRow = [];
          curVal = '';
          i++;
          continue;
        } else if (char === '\n') {
          curRow.push(curVal.trim());
          rows.push(curRow);
          curRow = [];
          curVal = '';
          i++;
          continue;
        } else {
          curVal += char;
          i++;
          continue;
        }
      }
    }

    if (curVal.length > 0 || curRow.length > 0) {
      curRow.push(curVal.trim());
      rows.push(curRow);
    }
    return rows;
  };

  const parsedRows = parseCsvLines(trimmedText);
  if (parsedRows.length === 0) return [];

  const rawHeaders = parsedRows[0];
  const headers = rawHeaders.map((h, idx) => (h ? h.replace(/^["']|["']$/g, '').trim() : `col_${idx}`));

  const objects = [];
  for (let i = 1; i < parsedRows.length; i++) {
    const rowValues = parsedRows[i];
    if (!rowValues || rowValues.every(v => !v || v.trim().length === 0)) continue;

    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = rowValues[idx] || '';
    });
    objects.push(obj);
  }

  return objects;
}

/**
 * Robust GViz JSON Parser
 */
function parseGvizResponse(gvizText) {
  if (!gvizText || typeof gvizText !== 'string') throw new Error('Invalid GViz response format');
  const trimmed = gvizText.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.includes('<html') || trimmed.includes('ServiceLogin')) {
    throw new Error('Spreadsheet is not publicly viewable. Please share with "Anyone with the link → Viewer".');
  }

  const jsonMatch = trimmed.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
  if (!jsonMatch) throw new Error('Invalid GViz response format');

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[1]);
  } catch (e) {
    throw new Error('Failed to parse GViz JSON structure');
  }

  if (!parsed.table || !parsed.table.rows || parsed.table.rows.length === 0) return [];

  let headers = (parsed.table.cols || []).map((col, idx) => {
    const label = col.label || col.id || '';
    return label.trim() || `col_${idx}`;
  });

  let rows = parsed.table.rows;

  const firstRowCells = rows[0]?.c || [];
  const firstRowValues = firstRowCells.map(c => {
    if (!c) return '';
    if (c.v !== null && c.v !== undefined) return String(c.v).trim();
    if (c.f !== null && c.f !== undefined) return String(c.f).trim();
    return '';
  });
  
  const isHeaderRow = firstRowValues.some(val => 
    ['title', 'name', 'headline', 'url', 'link', 'author', 'by', 'category', 'date', 'image', 'photo', 'cover', 'thumbnail'].some(term => val.toLowerCase().includes(term))
  );

  if (isHeaderRow) {
    headers = firstRowValues.map((val, idx) => val || headers[idx] || `col_${idx}`);
    rows = rows.slice(1);
  }

  return rows.map(row => {
    const obj = {};
    (row.c || []).forEach((cell, idx) => {
      const header = headers[idx] || `col_${idx}`;
      let cellVal = '';
      if (cell) {
        if (cell.v !== null && cell.v !== undefined) cellVal = String(cell.v).trim();
        else if (cell.f !== null && cell.f !== undefined) cellVal = String(cell.f).trim();
      }
      obj[header] = cellVal;
    });
    return obj;
  });
}

/**
 * Main Google Sheet Fetcher Service
 */
export async function fetchSheetContent(sheetInput, apiKey = '', bypassCache = false) {
  console.log('[THE-HINDU] API request received: Sheet fetch process initiated');

  const envSheetId = process.env.THE_HINDU_SHEET_ID || process.env.GOOGLE_SHEET_ID || process.env.DEFAULT_SHEET_ID;
  const envSheetUrl = process.env.THE_HINDU_SHEET_URL || process.env.DEFAULT_SHEET_URL;

  let sheetId = '';
  if (sheetInput && typeof sheetInput === 'string' && sheetInput.trim().length > 0) {
    sheetId = extractSheetId(sheetInput);
  }
  if (!sheetId && envSheetId) {
    sheetId = extractSheetId(envSheetId);
  }
  if (!sheetId && envSheetUrl) {
    sheetId = extractSheetId(envSheetUrl);
  }
  if (!sheetId) {
    sheetId = DEFAULT_THE_HINDU_SHEET_ID;
  }

  const sheetName = process.env.THE_HINDU_SHEET_NAME || process.env.SHEET_NAME || '';
  const sheetRange = process.env.THE_HINDU_SHEET_RANGE || process.env.SHEET_RANGE || 'A1:Z1000';
  const sheetGid = process.env.THE_HINDU_GID || process.env.GID || '';
  const effectiveApiKey = apiKey || process.env.GOOGLE_SHEETS_API_KEY || '';

  console.log(`[THE-HINDU] Spreadsheet ID: ${maskSheetId(sheetId)}`);
  console.log(`[THE-HINDU] Sheet Name: ${sheetName ? sheetName : 'DEFAULT (First Tab)'}`);
  console.log(`[THE-HINDU] Sheet GID: ${sheetGid ? sheetGid : 'DEFAULT (0)'}`);
  console.log(`[THE-HINDU] Auth Strategy: ${effectiveApiKey ? 'Google Sheets API Key' : 'Public Access (GViz/CSV)'}`);

  const cacheKey = `sheet_data_v4_${sheetId}_${sheetName}_${sheetGid}`;

  if (!bypassCache) {
    const cached = getCache(cacheKey);
    if (cached && cached.success && cached.items && cached.items.length > 0) {
      console.log(`[THE-HINDU] Cache HIT: Returning ${cached.items.length} cached articles for ${maskSheetId(sheetId)}`);
      return cached;
    }
    console.log(`[THE-HINDU] Cache MISS: Fetching fresh data for ${maskSheetId(sheetId)}`);
  } else {
    console.log(`[THE-HINDU] Cache BYPASS requested: Fetching fresh data from Google Sheets for ${maskSheetId(sheetId)}`);
  }

  const httpHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
  };

  let lastError = null;

  // Strategy 1: Google Sheets API v4 with API Key
  if (effectiveApiKey) {
    try {
      console.log('[THE-HINDU] Attempting Strategy 1: Google Sheets API v4');
      const rangeParam = sheetName ? `${encodeURIComponent(sheetName)}!${sheetRange}` : sheetRange;
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${rangeParam}?key=${effectiveApiKey}`;
      const response = await axios.get(apiUrl, { timeout: 15000, headers: httpHeaders });
      console.log(`[THE-HINDU] Strategy 1 HTTP Status: ${response.status}`);
      
      if (response.data && response.data.values && response.data.values.length > 0) {
        const rawValues = response.data.values;
        const [headers, ...rows] = rawValues;
        const rowObjects = rows.map(r => {
          const obj = {};
          (headers || []).forEach((h, idx) => {
            obj[h] = r[idx] || '';
          });
          return obj;
        });

        const items = rowObjects.map((row, idx) => normalizeSheetRow(row, idx)).filter(Boolean);
        console.log(`[THE-HINDU] Strategy 1 succeeded: Received ${rows.length} rows, parsed ${items.length} articles`);

        if (items.length > 0) {
          const result = {
            success: true,
            source: 'the-hindu',
            sourceType: 'google_sheets_api',
            sheetId,
            count: items.length,
            items,
            data: items,
            categories: [...new Set(items.map(i => i.category))],
            authors: [...new Set(items.map(i => i.author))],
            fetchedAt: new Date().toISOString()
          };
          setCache(cacheKey, result, 600);
          return result;
        }
      }
    } catch (e) {
      console.warn(`[THE-HINDU] Strategy 1 (API v4) failed: ${e.message}`);
      lastError = e;
    }
  }

  // Strategy 2: Google Visualization API (GViz Endpoint)
  try {
    console.log('[THE-HINDU] Attempting Strategy 2: Google Visualization API (GViz)');
    let gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    if (sheetName) gvizUrl += `&sheet=${encodeURIComponent(sheetName)}`;
    if (sheetGid) gvizUrl += `&gid=${sheetGid}`;

    const response = await axios.get(gvizUrl, { timeout: 15000, headers: httpHeaders });
    console.log(`[THE-HINDU] Strategy 2 HTTP Status: ${response.status}`);

    const rowObjects = parseGvizResponse(response.data);
    const items = rowObjects.map((row, idx) => normalizeSheetRow(row, idx)).filter(Boolean);
    console.log(`[THE-HINDU] Strategy 2 succeeded: Received ${rowObjects.length} rows, parsed ${items.length} articles`);

    if (items.length > 0) {
      const result = {
        success: true,
        source: 'the-hindu',
        sourceType: 'gviz_public',
        sheetId,
        count: items.length,
        items,
        data: items,
        categories: [...new Set(items.map(i => i.category))],
        authors: [...new Set(items.map(i => i.author))],
        fetchedAt: new Date().toISOString()
      };
      setCache(cacheKey, result, 600);
      return result;
    }
  } catch (e) {
    console.warn(`[THE-HINDU] Strategy 2 (GViz) failed: ${e.message}`);
    lastError = e;
  }

  // Strategy 3: Public CSV Export
  try {
    console.log('[THE-HINDU] Attempting Strategy 3: Public CSV Export');
    let csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    if (sheetGid) csvUrl += `&gid=${sheetGid}`;
    if (sheetName) csvUrl += `&sheet=${encodeURIComponent(sheetName)}`;

    const response = await axios.get(csvUrl, { timeout: 15000, headers: httpHeaders });
    console.log(`[THE-HINDU] Strategy 3 HTTP Status: ${response.status}`);

    const rowObjects = parseCsvToObjects(response.data);
    const items = rowObjects.map((row, idx) => normalizeSheetRow(row, idx)).filter(Boolean);
    console.log(`[THE-HINDU] Strategy 3 succeeded: Received ${rowObjects.length} rows, parsed ${items.length} articles`);

    if (items.length > 0) {
      const result = {
        success: true,
        source: 'the-hindu',
        sourceType: 'csv_public',
        sheetId,
        count: items.length,
        items,
        data: items,
        categories: [...new Set(items.map(i => i.category))],
        authors: [...new Set(items.map(i => i.author))],
        fetchedAt: new Date().toISOString()
      };
      setCache(cacheKey, result, 600);
      return result;
    }
  } catch (e) {
    console.warn(`[THE-HINDU] Strategy 3 (CSV) failed: ${e.message}`);
    lastError = e;
  }

  // If all strategies fail, do NOT return fake/sample data. Throw proper HTTP 500 error.
  const errorDetails = lastError ? lastError.message : 'No valid article data could be fetched from Google Sheets.';
  console.error(`[THE-HINDU] ERROR: All fetch strategies failed for Spreadsheet ID ${maskSheetId(sheetId)}. Details: ${errorDetails}`);
  
  const err = new Error(errorDetails.includes('publicly viewable') 
    ? errorDetails 
    : 'Unable to fetch The Hindu Google Sheet. Please verify spreadsheet access permissions.'
  );
  err.statusCode = 500;
  err.originalError = errorDetails;
  throw err;
}



