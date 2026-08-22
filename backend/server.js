import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { fetchSheetContent } from './services/googleSheetService.js';
import { extractContentFromUrl } from './services/contentExtractor.js';
import { clearCache } from './services/cacheService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Production CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Server Logging Middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API Request] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  }
  next();
});

// API Route: Google Sheet Content Fetching & Normalization
app.get('/api/sheet', async (req, res) => {
  try {
    const sheetInput = req.query.url || process.env.DEFAULT_SHEET_URL;
    const apiKey = req.query.apiKey || process.env.GOOGLE_SHEETS_API_KEY;

    const sheetData = await fetchSheetContent(sheetInput, apiKey);
    return res.status(200).json(sheetData);
  } catch (error) {
    console.error('[API /api/sheet Error]', error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to process Google Sheet data.',
      statusCode,
      details: error.details || null
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
        error: 'Missing required query parameter "url".',
        statusCode: 400
      });
    }

    const extracted = await extractContentFromUrl(targetUrl);
    return res.status(200).json(extracted);
  } catch (error) {
    console.error('[API /api/extract-content Error]', error.message);
    return res.status(500).json({
      success: false,
      error: 'Unable to preview this content.',
      statusCode: 500,
      details: error.message
    });
  }
});

// API Route: Clear Server Cache
app.post('/api/clear-cache', (req, res) => {
  clearCache();
  console.log('[Cache Service] In-memory cache cleared successfully.');
  return res.status(200).json({ success: true, message: 'Cache flushed successfully.' });
});

// API Route: Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend dist in production or development
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: `API route not found: ${req.path}`,
      statusCode: 404
    });
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>NeoLibrary Backend Server</title></head>
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
  console.log(`🚀 NeoLibrary Website API Server is LIVE on port ${PORT}`);
  console.log(`👉 Open in your browser: http://localhost:${PORT}`);
  console.log('==================================================\n');
});
