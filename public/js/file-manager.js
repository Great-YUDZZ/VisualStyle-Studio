/**
 * VisualStyle Studio — File Manager & Storage Sync
 * Handles project loading (Local API & HTML5 File System Access API),
 * live iframe rendering, and non-destructive disk saving.
 */

export class FileManager {
  constructor(app) {
    this.app = app;
    this.currentProjectPath = '';
    this.currentHtmlFile = '';
    this.currentHtmlContent = '';
    this.projectTree = [];

    // Native HTML5 File System Handle (if opened via browser picker)
    this.directoryHandle = null;

    this.fileTreeEl = document.getElementById('project-files-tree');
    this.projectPathText = document.getElementById('project-path-display');
  }

  // Load Built-in Sample Project
  async loadSampleProject() {
    this.app.boundary.showSkeleton();
    try {
      const res = await fetch('/api/project/sample');
      if (!res.ok) throw new Error('Gagal memuat proyek contoh');
      const data = await res.json();

      this.currentProjectPath = data.projectPath;
      this.currentHtmlFile = data.entryFile;
      this.projectTree = data.tree;

      await this.loadFileIntoPreview(this.currentHtmlFile);
      this.renderFileTree(this.projectTree);
      this.updateProjectDisplay(data.name || 'Apex Vault Protocol');
      this.app.boundary.hideEmptyState();
      this.app.boundary.showToast('Proyek contoh Apex Vault berhasil dimuat!');
    } catch (err) {
      console.error(err);
      this.app.boundary.showError('Gagal Memuat Proyek Contoh', err.message, () => this.loadSampleProject());
    } finally {
      this.app.boundary.hideSkeleton();
    }
  }

  // Open Native Directory via Electron IPC, Browser API, or Server API
  async openFolder() {
    // 1. Native Desktop Window (Electron)
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.openFolder();
        if (!result) return; // User cancelled
        this.currentProjectPath = result.folderPath;
        this.projectTree = result.tree;

        const htmlFile = this.findHtmlFileInTree(this.projectTree);
        if (!htmlFile) throw new Error('Tidak ditemukan file .html dalam folder ini.');

        this.currentHtmlFile = htmlFile.path;
        const htmlContent = await window.electronAPI.readFile(htmlFile.path);
        await this.renderRawHtmlToPreview(htmlContent, htmlFile.path);
        this.renderFileTree(this.projectTree);
        this.updateProjectDisplay(result.folderPath);
        this.app.boundary.hideEmptyState();
        this.app.boundary.showToast(`Folder berhasil dibuka secara native!`);
        return;
      } catch (err) {
        console.error('Electron openFolder error:', err);
        this.app.boundary.showError('Gagal Membuka Folder', err.message);
        return;
      }
    }

    // 2. Try HTML5 File System Access API if supported
    if ('showDirectoryPicker' in window) {
      try {
        this.directoryHandle = await window.showDirectoryPicker();
        this.currentProjectPath = this.directoryHandle.name;
        this.updateProjectDisplay(this.directoryHandle.name);

        // Find entry HTML file in directory
        let foundHtml = null;
        let foundName = '';
        for await (const entry of this.directoryHandle.values()) {
          if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.html')) {
            foundHtml = entry;
            foundName = entry.name;
            if (entry.name.toLowerCase() === 'index.html') break;
          }
        }

        if (!foundHtml) {
          throw new Error('Tidak ada file .html yang ditemukan dalam folder ini.');
        }

        const file = await foundHtml.getFile();
        const content = await file.text();
        this.currentHtmlFile = foundName;
        await this.renderRawHtmlToPreview(content, foundName);
        this.app.boundary.showToast(`Folder "${this.directoryHandle.name}" berhasil dibuka!`);
        this.app.boundary.hideEmptyState();
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // User cancelled
        console.warn('File System Access API error/fallback:', err);
      }
    }

    // 2. Fallback: Prompt local path input
    const inputPath = prompt('Masukkan absolute path folder proyek lokal Anda:', this.currentProjectPath || '/media/yudz/FLASHDISK/VisualStyle Studio/public/sample-project');
    if (!inputPath) return;

    this.app.boundary.showSkeleton();
    try {
      const res = await fetch(`/api/project/tree?dir=${encodeURIComponent(inputPath)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuka folder');

      this.currentProjectPath = data.projectPath;
      this.projectTree = data.tree;

      // Find first html file
      const htmlFile = this.findHtmlFileInTree(this.projectTree);
      if (!htmlFile) throw new Error('Tidak ditemukan file .html di folder ini');

      this.currentHtmlFile = htmlFile.path;
      await this.loadFileIntoPreview(this.currentHtmlFile);
      this.renderFileTree(this.projectTree);
      this.updateProjectDisplay(this.currentProjectPath);
      this.app.boundary.hideEmptyState();
      this.app.boundary.showToast(`Folder proyek berhasil dibuka!`);
    } catch (err) {
      this.app.boundary.showError('Gagal Membuka Folder', err.message, () => this.openFolder());
    } finally {
      this.app.boundary.hideSkeleton();
    }
  }

  findHtmlFileInTree(items) {
    if (!items) return null;
    let candidate = null;
    for (const item of items) {
      if (item.type === 'file' && item.extension === '.html') {
        if (item.name.toLowerCase() === 'index.html') return item;
        if (!candidate) candidate = item;
      } else if (item.type === 'directory' && item.children) {
        const sub = this.findHtmlFileInTree(item.children);
        if (sub) {
          if (sub.name.toLowerCase() === 'index.html') return sub;
          if (!candidate) candidate = sub;
        }
      }
    }
    return candidate;
  }

  // Load a file via Server API and render to sandbox
  async loadFileIntoPreview(filePath) {
    if (window.electronAPI) {
      try {
        const htmlText = await window.electronAPI.readFile(filePath);
        await this.renderRawHtmlToPreview(htmlText, filePath);
        return;
      } catch (err) {
        console.error('Electron loadFile error:', err);
      }
    }

    const res = await fetch(`/api/project/file?path=${encodeURIComponent(filePath)}`);
    if (!res.ok) throw new Error('Gagal membaca berkas: ' + filePath);
    const htmlText = await res.text();
    await this.renderRawHtmlToPreview(htmlText, filePath);
  }

  // Inject inspector-bridge.js, resolve and inline local CSS files, and load into iframe
  async renderRawHtmlToPreview(rawHtml, filePath = '') {
    this.currentHtmlContent = rawHtml;
    const iframe = document.getElementById('preview-iframe');
    if (!iframe) return;

    let modifiedHtml = rawHtml;

    // 1. Determine base directory
    let dir = '';
    const isSample = filePath.includes('sample-project') || !filePath;
    if (filePath && filePath.includes('/')) {
      dir = filePath.substring(0, filePath.lastIndexOf('/'));
    }

    // 2. Scan and inline all local stylesheet <link> tags
    // Matches: <link rel="stylesheet" href="..."> or <link href="..." rel="stylesheet">
    const linkRegex = /<link\b[^>]*\brel=["']stylesheet["'][^>]*>|<link\b[^>]*\bhref=["'][^"']*["'][^>]*\brel=["']stylesheet["'][^>]*>/gi;
    const matches = Array.from(modifiedHtml.matchAll(linkRegex));

    for (const match of matches) {
      const fullTag = match[0];
      const hrefMatch = fullTag.match(/href=["']([^"']+)["']/i);
      if (!hrefMatch) continue;

      const href = hrefMatch[1];
      // Skip external CDN stylesheets (e.g. Google Fonts)
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
        continue;
      }

      // It's a local stylesheet (e.g. styles.css, custom-styles.css, ./styles.css)
      const cleanHref = href.replace(/^\.\//, '');
      let cssContent = null;

      // Method A: Try Electron API if running in desktop app
      if (window.electronAPI && dir) {
        try {
          const absPath = `${dir}/${cleanHref}`;
          cssContent = await window.electronAPI.readFile(absPath);
        } catch (e) {
          // File might not exist yet (e.g. custom-styles.css before first save)
        }
      }

      // Method B: If sample-project or relative, fetch from web server
      if (cssContent === null && isSample) {
        try {
          const res = await fetch(`/sample-project/${cleanHref}`);
          if (res.ok) {
            cssContent = await res.text();
          }
        } catch (e) {
          console.warn('Sample fetch CSS failed for:', href, e);
        }
      }

      // Method C: Fetch via /api/project/file
      if (cssContent === null && dir) {
        try {
          const targetPath = `${dir}/${cleanHref}`;
          const res = await fetch(`/api/project/file?path=${encodeURIComponent(targetPath)}`);
          if (res.ok) {
            cssContent = await res.text();
          }
        } catch (e) {
          console.warn('API fetch CSS failed for:', href, e);
        }
      }

      // If we retrieved the CSS content, replace the <link> tag with an inline <style> tag
      if (cssContent !== null) {
        const styleTag = `\n<style data-source-href="${href}">\n/* Inlined by VisualStyle Studio for 100% Fidelity */\n${cssContent}\n</style>\n`;
        modifiedHtml = modifiedHtml.replace(fullTag, styleTag);
      }
    }

    // 3. Inject base tag for relative images and scripts
    const baseHref = isSample 
      ? 'http://localhost:4200/sample-project/' 
      : (dir ? `/api/project/file?path=${encodeURIComponent(dir)}/` : '/');
    const baseTag = `\n  <base href="${baseHref}">\n`;

    if (modifiedHtml.includes('<head>')) {
      modifiedHtml = modifiedHtml.replace('<head>', `<head>${baseTag}`);
    } else if (modifiedHtml.includes('<html>')) {
      modifiedHtml = modifiedHtml.replace('<html>', `<html><head>${baseTag}</head>`);
    }

    // 4. Inject Bridge Script before </head> or </body>
    const bridgeScriptTag = `\n<script src="/js/inspector-bridge.js"></script>\n`;
    if (modifiedHtml.includes('</head>')) {
      modifiedHtml = modifiedHtml.replace('</head>', `${bridgeScriptTag}</head>`);
    } else if (modifiedHtml.includes('</body>')) {
      modifiedHtml = modifiedHtml.replace('</body>', `${bridgeScriptTag}</body>`);
    } else {
      modifiedHtml += bridgeScriptTag;
    }

    // 5. Assign to iframe.srcdoc
    iframe.srcdoc = modifiedHtml;

    // 6. Update URL bar in preview header
    const urlBar = document.getElementById('viewport-url-text');
    if (urlBar) {
      const fileName = filePath ? filePath.split('/').pop() : 'index.html';
      urlBar.textContent = `local://${fileName || 'index.html'}`;
    }
  }

  renderFileTree(items) {
    if (!this.fileTreeEl || !items) return;
    this.fileTreeEl.innerHTML = '';

    const createNode = (item, parent, depth = 0) => {
      const row = document.createElement('div');
      row.className = 'tree-node';
      row.style.paddingLeft = `${0.75 + depth * 0.75}rem`;

      const icon = item.type === 'directory' 
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`;

      row.innerHTML = `
        ${icon}
        <span style="font-family: var(--font-mono); font-size: 11px;">${item.name}</span>
      `;

      if (item.type === 'file' && item.extension === '.html') {
        row.addEventListener('click', () => {
          this.currentHtmlFile = item.path;
          this.loadFileIntoPreview(item.path);
        });
      }

      parent.appendChild(row);

      if (item.type === 'directory' && item.children) {
        item.children.forEach(child => createNode(child, parent, depth + 1));
      }
    };

    items.forEach(item => createNode(item, this.fileTreeEl, 0));
  }

  updateProjectDisplay(name) {
    if (this.projectPathText) {
      this.projectPathText.textContent = name;
    }
  }

  // Save changes back to disk
  async saveChangesToDisk(allCssContent) {
    // 0. Native Desktop Window (Electron)
    if (window.electronAPI) {
      try {
        const res = await window.electronAPI.saveChanges({
          projectDir: this.currentProjectPath,
          htmlFilePath: this.currentHtmlFile,
          cssFileName: 'custom-styles.css',
          cssContent: allCssContent
        });
        this.app.boundary.showToast(`custom-styles.css tersimpan secara native (${res.elapsedMs}ms)!`);
        const syncStatusEl = document.getElementById('status-sync-indicator');
        if (syncStatusEl) {
          syncStatusEl.textContent = 'custom-styles.css (synced)';
          syncStatusEl.style.color = '#047857';
        }
        return;
      } catch (err) {
        console.error('Electron save error:', err);
        this.app.boundary.showError('Gagal Menyimpan ke Disk', err.message);
        return;
      }
    }

    // 1. If opened via File System Access API
    if (this.directoryHandle) {
      try {
        const cssHandle = await this.directoryHandle.getFileHandle('custom-styles.css', { create: true });
        const writable = await cssHandle.createWritable();
        await writable.write(allCssContent);
        await writable.close();

        // Also ensure link tag in HTML
        if (this.currentHtmlFile) {
          const htmlHandle = await this.directoryHandle.getFileHandle(this.currentHtmlFile);
          const file = await htmlHandle.getFile();
          let text = await file.text();
          if (!text.includes('custom-styles.css')) {
            const linkTag = `\n    <!-- Injected by VisualStyle Studio -->\n    <link rel="stylesheet" href="custom-styles.css">\n`;
            if (text.includes('</head>')) text = text.replace('</head>', `${linkTag}</head>`);
            else text = linkTag + text;
            const htmlWritable = await htmlHandle.createWritable();
            await htmlWritable.write(text);
            await htmlWritable.close();
          }
        }

        this.app.boundary.showToast('custom-styles.css berhasil disimpan ke disk!');
        return;
      } catch (err) {
        console.warn('Native write fallback:', err);
      }
    }

    // 2. Save via Server API
    if (!this.currentProjectPath) {
      this.app.boundary.showError('Belum Ada Proyek Dibuka', 'Silakan buka folder proyek terlebih dahulu sebelum menyimpan.');
      return;
    }

    try {
      const res = await fetch('/api/project/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectDir: this.currentProjectPath,
          htmlFilePath: this.currentHtmlFile,
          cssFileName: 'custom-styles.css',
          cssContent: allCssContent
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan berkas');

      this.app.boundary.showToast(`custom-styles.css tersimpan (${data.elapsedMs}ms)!`);
      const syncStatusEl = document.getElementById('status-sync-indicator');
      if (syncStatusEl) {
        syncStatusEl.textContent = 'custom-styles.css (synced)';
        syncStatusEl.style.color = '#047857';
      }
    } catch (err) {
      this.app.boundary.showError('Gagal Menyimpan ke Disk', err.message, () => this.saveChangesToDisk(allCssContent));
    }
  }

  // Save Sandbox Web Page (sandbox.html + styles) to Disk
  async saveSandboxToDisk(htmlContent, cssContent) {
    if (window.electronAPI && window.electronAPI.saveSandbox) {
      try {
        const projDir = this.currentProjectPath || 'sandbox-project';
        const result = await window.electronAPI.saveSandbox({
          projectDir: projDir,
          htmlContent,
          cssContent
        });
        this.app.boundary.showToast(`Halaman sandbox.html berhasil disimpan ke disk (${result.elapsedMs}ms)!`);
        return;
      } catch (err) {
        console.warn('Electron save fallback:', err);
      }
    }

    try {
      const res = await fetch('/api/project/save-sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectDir: this.currentProjectPath,
          htmlContent,
          cssContent
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan sandbox');

      this.app.boundary.showToast(`Halaman sandbox.html berhasil disimpan ke disk (${data.elapsedMs}ms)!`);
      const syncStatusEl = document.getElementById('status-sync-indicator');
      if (syncStatusEl) {
        syncStatusEl.textContent = 'sandbox.html (synced)';
        syncStatusEl.style.color = '#047857';
      }
    } catch (err) {
      // Fallback: download as file
      this.exportCssFile(cssContent);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sandbox.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.app.boundary.showToast('Halaman sandbox.html berhasil diunduh!');
    }
  }

  // Export / Download CSS File
  exportCssFile(content) {
    const blob = new Blob([content], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-styles.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.app.boundary.showToast('custom-styles.css berhasil diunduh!');
  }
}
