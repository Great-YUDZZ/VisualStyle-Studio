const { app, BrowserWindow, ipcMain, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const http = require('http');
const { fork } = require('child_process');

let mainWindow;
let serverProcess = null;
const SERVER_PORT = 4200;

// Check if local server is listening
function checkServerReady(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/status`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(400, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Automatically ensure server.js is running in the background
async function ensureServerRunning() {
  const isRunning = await checkServerReady(SERVER_PORT);
  if (isRunning) return true;

  const serverPath = path.join(__dirname, '../server.js');
  serverProcess = fork(serverPath, [], {
    stdio: 'ignore'
  });

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 100));
    if (await checkServerReady(SERVER_PORT)) return true;
  }
  return false;
}

async function createWindow() {
  // Ensure local server is ready so all CSS styles, fonts, and ES Modules load cleanly
  await ensureServerRunning();

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    title: 'VisualStyle Studio — Visual CSS & Animation Workbench',
    backgroundColor: '#F8FAFC',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Allows iframe loading across local files and origins
    },
    autoHideMenuBar: true
  });

  // Strip X-Frame-Options and CSP headers to allow previewing local web projects inside iframes
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];
    callback({ cancel: false, responseHeaders });
  });

  // Load via localhost so all CSS styling, icons, and modules render with 100% fidelity
  mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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

  return result.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });
}

// IPC: Native Open Folder Dialog
ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Pilih Folder Proyek Website',
    properties: ['openDirectory']
  });
  if (canceled || filePaths.length === 0) return null;

  const folderPath = filePaths[0];
  const tree = await scanProjectDirectory(folderPath);
  return { folderPath, tree };
});

// IPC: Native Open File Dialog
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Pilih File HTML untuk Di-preview',
    filters: [
      { name: 'HTML Files', extensions: ['html', 'htm'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  if (canceled || filePaths.length === 0) return null;
  return filePaths[0];
});

// IPC: Read Local File
ipcMain.handle('file:read', async (event, filePath) => {
  if (!fs.existsSync(filePath)) throw new Error('File not found: ' + filePath);
  return await fsp.readFile(filePath, 'utf-8');
});

// IPC: Scan Project Tree
ipcMain.handle('project:getTree', async (event, dirPath) => {
  if (!fs.existsSync(dirPath)) throw new Error('Directory not found: ' + dirPath);
  return await scanProjectDirectory(dirPath);
});

// IPC: Save Changes Non-Destructively
ipcMain.handle('file:save', async (event, { projectDir, htmlFilePath, cssFileName = 'custom-styles.css', cssContent }) => {
  const startTime = Date.now();
  if (!projectDir || !fs.existsSync(projectDir)) {
    throw new Error('Direktori proyek tidak valid');
  }

  // 1. Safe write custom-styles.css
  const targetCssPath = path.join(projectDir, cssFileName);
  const tempCssPath = targetCssPath + '.tmp';
  await fsp.writeFile(tempCssPath, cssContent || '', 'utf-8');
  await fsp.rename(tempCssPath, targetCssPath);

  // 2. Check and inject <link> into HTML head
  let htmlInjected = false;
  let targetHtml = htmlFilePath;
  if (!targetHtml) {
    const defaultIndex = path.join(projectDir, 'index.html');
    if (fs.existsSync(defaultIndex)) targetHtml = defaultIndex;
  }

  if (targetHtml && fs.existsSync(targetHtml)) {
    let htmlText = await fsp.readFile(targetHtml, 'utf-8');
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
      await fsp.writeFile(targetHtml, htmlText, 'utf-8');
    }
  }

  const elapsedMs = Date.now() - startTime;
  return {
    success: true,
    cssPath: targetCssPath,
    htmlPath: targetHtml,
    htmlInjected,
    elapsedMs
  };
});

// IPC: Save Sandbox Page
ipcMain.handle('file:saveSandbox', async (event, { projectDir, htmlContent = '', cssContent = '' }) => {
  const startTime = Date.now();
  const targetDir = (projectDir && fs.existsSync(projectDir)) ? projectDir : path.join(__dirname, '../public/sample-project');
  const targetHtmlPath = path.join(targetDir, 'sandbox.html');
  const targetCssPath = path.join(targetDir, 'custom-styles.css');

  await fsp.writeFile(targetHtmlPath, htmlContent, 'utf-8');
  if (cssContent) {
    await fsp.writeFile(targetCssPath, cssContent, 'utf-8');
  }

  const elapsedMs = Date.now() - startTime;
  return {
    success: true,
    htmlPath: targetHtmlPath,
    cssPath: targetCssPath,
    elapsedMs
  };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
      serverProcess = null;
    }
    app.quit();
  }
});
