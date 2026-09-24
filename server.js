import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) { // 10MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON: ' + err.message));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message, details = null) {
  sendJson(res, statusCode, { error: message, details });
}

// Recursively scan project folder for tree
async function scanProjectDirectory(dirPath, maxDepth = 4, currentDepth = 0) {
  if (currentDepth > maxDepth) return null;
  const items = await fsp.readdir(dirPath, { withFileTypes: true });
  const result = [];

  for (const item of items) {
    if (item.name.startsWith('.') || item.name === 'node_modules') continue;
    const fullPath = path.join(dirPath, item.name);
    
    if (item.isDirectory()) {
      const children = await scanProjectDirectory(fullPath, maxDepth, currentDepth + 1);
      result.push({
        name: item.name,
        type: 'directory',
        path: fullPath,
        children: children || []
      });
    } else {
      const ext = path.extname(item.name).toLowerCase();
      result.push({
        name: item.name,
        type: 'file',
        extension: ext,
        path: fullPath
      });
    }
  }

  // Sort directories first, then alphabetical
  return result.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // API: System Status
    if (pathname === '/api/status' && req.method === 'GET') {
      const mem = process.memoryUsage();
      return sendJson(res, 200, {
        status: 'online',
        name: 'VisualStyle Studio Engine',
        version: '1.0.0',
        platform: process.platform,
        uptimeSeconds: Math.round(process.uptime()),
        memoryRssMb: (mem.rss / 1024 / 1024).toFixed(1),
        memoryHeapMb: (mem.heapUsed / 1024 / 1024).toFixed(1)
      });
    }

    // API: Sample Project Metadata
    if (pathname === '/api/project/sample' && req.method === 'GET') {
      const sampleDir = path.join(PUBLIC_DIR, 'sample-project');
      const tree = await scanProjectDirectory(sampleDir);
      return sendJson(res, 200, {
        projectPath: sampleDir,
        name: 'Apex Vault Protocol (Sample)',
        tree,
        entryFile: path.join(sampleDir, 'index.html')
      });
    }

    // API: Scan Directory Tree
    if (pathname === '/api/project/tree' && req.method === 'GET') {
      const targetDir = parsedUrl.searchParams.get('dir') || path.join(PUBLIC_DIR, 'sample-project');
      if (!fs.existsSync(targetDir)) {
        return sendError(res, 404, 'Direktori tidak ditemukan di sistem berkas');
      }
      const tree = await scanProjectDirectory(targetDir);
      return sendJson(res, 200, { projectPath: targetDir, tree });
    }

    // API: Read Local File
    if (pathname === '/api/project/file' && req.method === 'GET') {
      const targetPath = parsedUrl.searchParams.get('path');
      if (!targetPath || !fs.existsSync(targetPath)) {
        return sendError(res, 404, 'Berkas tidak ditemukan: ' + targetPath);
      }
      const stat = await fsp.stat(targetPath);
      if (stat.isDirectory()) {
        return sendError(res, 400, 'Jalur yang diminta adalah direktori, bukan berkas');
      }
      const ext = path.extname(targetPath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      const content = await fsp.readFile(targetPath);
      res.writeHead(200, {
        'Content-Type': mime,
        'Content-Length': content.length,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
      return;
    }

    // API: Save CSS Changes and Sync HTML Link
    if (pathname === '/api/project/save' && req.method === 'POST') {
      const startTime = Date.now();
      const body = await parseBody(req);
      const { projectDir, htmlFilePath, cssFileName = 'custom-styles.css', cssContent } = body;

      if (!projectDir || !fs.existsSync(projectDir)) {
        return sendError(res, 400, 'Direktori proyek tidak valid atau tidak ditemukan');
      }

      // 1. Safe Write CSS file in project directory
      const targetCssPath = path.join(projectDir, cssFileName);
      const tempCssPath = targetCssPath + '.tmp';
      await fsp.writeFile(tempCssPath, cssContent || '', 'utf-8');
      await fsp.rename(tempCssPath, targetCssPath);

      // 2. Check and inject <link> into target HTML file non-destructively
      let htmlInjected = false;
      let targetHtmlPath = htmlFilePath;
      if (!targetHtmlPath) {
        const defaultIndex = path.join(projectDir, 'index.html');
        if (fs.existsSync(defaultIndex)) targetHtmlPath = defaultIndex;
      }

      if (targetHtmlPath && fs.existsSync(targetHtmlPath)) {
        let htmlText = await fsp.readFile(targetHtmlPath, 'utf-8');
        const linkPattern = new RegExp(`href=["']\\.?/?${cssFileName}["']`, 'i');
        
        if (!linkPattern.test(htmlText)) {
          const linkTag = `\n    <!-- Injected by VisualStyle Studio -->\n    <link rel="stylesheet" href="${cssFileName}">\n`;
          if (htmlText.includes('</head>')) {
            htmlText = htmlText.replace('</head>', `${linkTag}</head>`);
            htmlInjected = true;
          } else if (htmlText.includes('<head>')) {
            htmlText = htmlText.replace('<head>', `<head>${linkTag}`);
            htmlInjected = true;
          } else {
            htmlText = linkTag + htmlText;
            htmlInjected = true;
          }
          await fsp.writeFile(targetHtmlPath, htmlText, 'utf-8');
        }
      }

      const elapsedMs = Date.now() - startTime;
      return sendJson(res, 200, {
        success: true,
        cssPath: targetCssPath,
        htmlPath: targetHtmlPath,
        htmlInjected,
        bytesWritten: (cssContent || '').length,
        elapsedMs,
        message: `custom-styles.css berhasil disimpan (${elapsedMs}ms)`
      });
    }

    // API: Save Sandbox Page (sandbox.html + custom-styles.css)
    if (pathname === '/api/project/save-sandbox' && req.method === 'POST') {
      const startTime = Date.now();
      const body = await parseBody(req);
      const { projectDir, htmlContent = '', cssContent = '' } = body;

      const targetDir = (projectDir && fs.existsSync(projectDir)) 
        ? projectDir 
        : path.join(PUBLIC_DIR, 'sample-project');

      const targetHtmlPath = path.join(targetDir, 'sandbox.html');
      const targetCssPath = path.join(targetDir, 'custom-styles.css');

      await fsp.writeFile(targetHtmlPath, htmlContent, 'utf-8');
      if (cssContent) {
        await fsp.writeFile(targetCssPath, cssContent, 'utf-8');
      }

      const elapsedMs = Date.now() - startTime;
      return sendJson(res, 200, {
        success: true,
        htmlPath: targetHtmlPath,
        cssPath: targetCssPath,
        elapsedMs,
        message: `Halaman sandbox.html berhasil disimpan (${elapsedMs}ms)`
      });
    }

    // Serve Static Files from public/
    let reqPath = pathname === '/' ? '/index.html' : pathname;
    let safePath = path.normalize(path.join(PUBLIC_DIR, reqPath));

    if (!safePath.startsWith(PUBLIC_DIR)) {
      return sendError(res, 403, 'Akses terlarang');
    }

    if (fs.existsSync(safePath) && (await fsp.stat(safePath)).isDirectory()) {
      safePath = path.join(safePath, 'index.html');
    }

    if (!fs.existsSync(safePath)) {
      return sendError(res, 404, 'File static tidak ditemukan: ' + pathname);
    }

    const ext = path.extname(safePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    const fileStream = fs.createReadStream(safePath);
    res.writeHead(200, { 'Content-Type': mime });
    fileStream.pipe(res);

  } catch (err) {
    console.error('Server error:', err);
    sendError(res, 500, 'Kesalahan internal server', err.message);
  }
});

const DEFAULT_PORT = 4200;
function startServer(port = DEFAULT_PORT) {
  server.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`🎨 VisualStyle Studio Engine (Offline-First Ready)`);
    console.log(`📍 Web Client:   http://localhost:${port}`);
    console.log(`⚡ Cold Start:   < 200ms | Zero External Binary Dependencies`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} sedang dipakai, mencoba port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Gagal menjalankan server:', err);
    }
  });
}

startServer();
