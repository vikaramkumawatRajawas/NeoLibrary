import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { fetchSheetContent } from './services/googleSheetService.js';
import { extractContentFromUrl } from './services/contentExtractor.js';
import { clearCache } from './services/cacheService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Route: Google Sheet Data Fetch & Data Mapping
app.get('/api/sheet', async (req, res) => {
  try {
    const sheetInput = req.query.url || process.env.DEFAULT_SHEET_URL;
    const apiKey = req.query.apiKey || process.env.GOOGLE_SHEETS_API_KEY;

    const sheetData = await fetchSheetContent(sheetInput, apiKey);
    return res.json(sheetData);
  } catch (error) {
    console.error('[API /api/sheet Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process Google Sheet data.',
      details: error.message
    });
  }
});

// API Route: URL Content Extraction Service
app.get('/api/extract-content', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameter "url".'
      });
    }

    const extracted = await extractContentFromUrl(targetUrl);
    return res.json(extracted);
  } catch (error) {
    console.error('[API /api/extract-content Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to preview this content.',
      details: error.message
    });
  }
});

// API Route: Clear In-Memory Cache
app.post('/api/clear-cache', (req, res) => {
  clearCache();
  return res.json({ success: true, message: 'Cache flushed successfully.' });
});

// API Route: Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

import fs from 'fs';

// Serve frontend dist in production or development
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>NeoLibrary Server</title></head>
        <body style="font-family:sans-serif;background:#080B18;color:#fff;padding:40px;text-align:center;">
          <h2>🚀 NeoLibrary Backend API Server Running</h2>
          <p>Please run <code>npm run build</code> first.</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n==================================================');
  console.log(`🚀 NeoLibrary Website is LIVE!`);
  console.log(`👉 Open in your browser: http://localhost:${PORT}`);
  console.log('==================================================\n');
});
