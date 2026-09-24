/**
 * VisualStyle Studio — Sandbox Visual Web Builder Engine
 * Figma-like visual canvas composer with drag-and-drop components, inline text editing,
 * image replacement, floating quick-action toolbar, and disk export.
 */

export const COMPONENT_DEFINITIONS = {
  // CONTAINERS
  'hero-section': {
    name: 'Hero Section',
    category: 'containers',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M7 9h10"/><path d="M9 13h6"/></svg>`,
    desc: 'Hero lengkap: badge, judul besar, subtitle, dan tombol CTA',
    html: `
<section class="sandbox-hero-section vs-comp-block" data-comp-type="hero">
  <div class="sandbox-badge">
    <span class="sandbox-badge-dot"></span>
    <span class="sandbox-badge-text">v2.4 Active Core &bull; High Performance</span>
  </div>
  <h1 class="sandbox-hero-title">Bangun Halaman Web dengan <span class="sandbox-gradient-text">Presisi Visual</span></h1>
  <p class="sandbox-hero-subtitle">Tarik dan letakkan komponen modular, sesuaikan warna dan animasi secara real-time langsung di kanvas desktop Anda.</p>
  <div class="sandbox-btn-group">
    <button class="sandbox-btn-primary"><span>Mulai Sekarang</span> &rarr;</button>
    <button class="sandbox-btn-secondary">Lihat Dokumentasi</button>
  </div>
</section>
`
  },

  'card-container': {
    name: 'Card Container',
    category: 'containers',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="3"/><path d="M3 9h18"/></svg>`,
    desc: 'Wadah kartu berpadding dengan border halus dan bayangan elegan',
    html: `
<div class="sandbox-card vs-comp-block" data-comp-type="card">
  <h3 class="sandbox-card-title">Judul Kartu Komponen</h3>
  <p class="sandbox-card-desc">Ini adalah wadah kartu serbaguna. Anda dapat meletakkan teks, tombol, atau gambar di dalamnya.</p>
  <button class="sandbox-btn-primary sandbox-btn-sm">Aksi Kartu</button>
</div>
`
  },

  'grid-2col': {
    name: 'Grid 2-Kolom',
    category: 'containers',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="12" x2="12" y1="3" y2="21"/></svg>`,
    desc: 'Tata letak 2 kolom berdampingan yang fleksibel dan responsif',
    html: `
<div class="sandbox-grid-2col vs-comp-block" data-comp-type="grid-2">
  <div class="sandbox-card">
    <h4 class="sandbox-card-title">Kolom Kiri</h4>
    <p class="sandbox-card-desc">Isi konten untuk bagian kiri. Klik ganda untuk mengubah teks ini.</p>
  </div>
  <div class="sandbox-card">
    <h4 class="sandbox-card-title">Kolom Kanan</h4>
    <p class="sandbox-card-desc">Isi konten untuk bagian kanan. Klik ganda untuk mengubah teks ini.</p>
  </div>
</div>
`
  },

  'grid-3col': {
    name: 'Grid 3-Kolom',
    category: 'containers',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="9" x2="9" y1="3" y2="21"/><line x1="15" x2="15" y1="3" y2="21"/></svg>`,
    desc: 'Matriks 3 kolom yang cocok untuk fitur atau produk',
    html: `
<div class="sandbox-grid-3col vs-comp-block" data-comp-type="grid-3">
  <div class="sandbox-card">
    <div class="sandbox-icon-bubble">⚡</div>
    <h4 class="sandbox-card-title">Cepat & Ringan</h4>
    <p class="sandbox-card-desc">Zero runtime latency dengan performa 60 FPS.</p>
  </div>
  <div class="sandbox-card">
    <div class="sandbox-icon-bubble">🛡️</div>
    <h4 class="sandbox-card-title">Aman & Teruji</h4>
    <p class="sandbox-card-desc">Didukung isolasi sandbox dan zero slippage.</p>
  </div>
  <div class="sandbox-card">
    <div class="sandbox-icon-bubble">🎨</div>
    <h4 class="sandbox-card-title">Visual Styling</h4>
    <p class="sandbox-card-desc">Ubah warna dan animasi langsung tanpa coding.</p>
  </div>
</div>
`
  },

  // TYPOGRAPHY & CONTENT
  'heading-h1': {
    name: 'Heading H1',
    category: 'content',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/></svg>`,
    desc: 'Judul utama berukuran besar dengan bobot tebal',
    html: `<h1 class="sandbox-heading-h1 vs-comp-block">Judul Utama Halaman Web</h1>`
  },

  'heading-h2': {
    name: 'Heading H2',
    category: 'content',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>`,
    desc: 'Sub-judul bagian bab atau section',
    html: `<h2 class="sandbox-heading-h2 vs-comp-block">Sub-Judul Bagian Section</h2>`
  },

  'paragraph': {
    name: 'Paragraf Teks',
    category: 'content',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>`,
    desc: 'Paragraf naratif dengan keterbacaan tinggi',
    html: `<p class="sandbox-paragraph vs-comp-block">Ini adalah teks paragraf yang bersih dan rapi. Anda dapat mengklik ganda untuk mengedit teks secara langsung sesuai kebutuhan halaman Anda.</p>`
  },

  'badge-pill': {
    name: 'Badge / Status Pill',
    category: 'content',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="10" x="3" y="7" rx="5"/></svg>`,
    desc: 'Pill status dengan titik indikator warna',
    html: `
<div class="sandbox-badge vs-comp-block">
  <span class="sandbox-badge-dot"></span>
  <span class="sandbox-badge-text">Fitur Baru &bull; v2.0 Siap Digunakan</span>
</div>
`
  },

  // MEDIA
  'image-card': {
    name: 'Image Box',
    category: 'media',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
    desc: 'Wadah gambar beradius dengan tombol ganti gambar',
    html: `
<div class="sandbox-image-container vs-comp-block" data-comp-type="image">
  <img class="sandbox-image" src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80" alt="Sample Abstract Image" />
  <div class="sandbox-image-caption">Visual Abstrak Gradien Modern</div>
</div>
`
  },

  // UI BLOCKS
  'btn-primary': {
    name: 'Primary Button',
    category: 'ui',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="10" x="3" y="7" rx="3"/></svg>`,
    desc: 'Tombol aksi utama bernuansa biru royal gradien',
    html: `<button class="sandbox-btn-primary vs-comp-block"><span>Klik Tombol Utama</span> &rarr;</button>`
  },

  'btn-secondary': {
    name: 'Outline Button',
    category: 'ui',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="10" x="3" y="7" rx="3" stroke-dasharray="2 2"/></svg>`,
    desc: 'Tombol sekunder bergaris batas halus',
    html: `<button class="sandbox-btn-secondary vs-comp-block">Tombol Sekunder</button>`
  },

  'stat-metric': {
    name: 'Metric Stat Card',
    category: 'ui',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>`,
    desc: 'Kotak metrik besar untuk KPI, angka statistik, atau pertumbuhan',
    html: `
<div class="sandbox-stat-card vs-comp-block" data-comp-type="metric">
  <div class="sandbox-stat-value">$1.42B+</div>
  <div class="sandbox-stat-label">Total Volume Terkunci</div>
  <div class="sandbox-stat-delta">&uarr; +18.4% minggu ini</div>
</div>
`
  },

  'feature-card': {
    name: 'Feature Card',
    category: 'ui',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    desc: 'Kartu fitur lengkap dengan ikon, judul, deskripsi, dan tombol',
    html: `
<div class="sandbox-feature-card vs-comp-block" data-comp-type="feature">
  <div class="sandbox-feature-icon">🚀</div>
  <h3 class="sandbox-feature-title">Eksekusi Instan</h3>
  <p class="sandbox-feature-desc">Perubahan warna dan animasi tersinkronisasi langsung ke berkas lokal secara non-destruktif.</p>
  <a href="#learn" class="sandbox-feature-link">Pelajari Selengkapnya &rarr;</a>
</div>
`
  },

  'navbar-block': {
    name: 'Navigation Bar',
    category: 'ui',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="8" x="2" y="3" rx="2"/><line x1="6" x2="18" y1="7" y2="7"/></svg>`,
    desc: 'Bilah navigasi lengkap dengan logo, menu tautan, dan tombol login',
    html: `
<nav class="sandbox-navbar vs-comp-block" data-comp-type="navbar">
  <div class="sandbox-nav-brand">
    <span class="sandbox-brand-logo">✦</span>
    <span class="sandbox-brand-name">BrandStudio</span>
  </div>
  <div class="sandbox-nav-links">
    <a href="#fitur" class="sandbox-nav-link">Fitur</a>
    <a href="#solusi" class="sandbox-nav-link">Solusi</a>
    <a href="#harga" class="sandbox-nav-link">Harga</a>
    <a href="#tentang" class="sandbox-nav-link">Tentang</a>
  </div>
  <button class="sandbox-btn-primary sandbox-btn-sm">Mulai Gratis</button>
</nav>
`
  }
};

export class SandboxBuilder {
  constructor(app) {
    this.app = app;
    this.isActive = false;
    this.canvasDoc = null;
    this.selectedElement = null;

    // Elements
    this.paletteContainer = document.getElementById('sandbox-component-palette');
    this.btnModeInspector = document.getElementById('btn-mode-inspector');
    this.btnModeSandbox = document.getElementById('btn-mode-sandbox');
    this.filesSection = document.getElementById('section-project-files');
    this.paletteSection = document.getElementById('section-component-palette');
    this.floatingToolbar = document.getElementById('sandbox-floating-toolbar');
    this.imageModal = document.getElementById('sandbox-image-modal');

    this.init();
  }

  init() {
    this.renderPalette();
    this.setupModeSwitcher();
    this.setupFloatingToolbar();
    this.setupImageModal();
  }

  setupModeSwitcher() {
    if (!this.btnModeInspector || !this.btnModeSandbox) return;

    this.btnModeInspector.addEventListener('click', () => {
      this.setMode(false);
    });

    this.btnModeSandbox.addEventListener('click', () => {
      this.setMode(true);
    });
  }

  setMode(isSandbox) {
    this.isActive = isSandbox;

    if (this.btnModeInspector) this.btnModeInspector.classList.toggle('active', !isSandbox);
    if (this.btnModeSandbox) this.btnModeSandbox.classList.toggle('active', isSandbox);

    const domSection = document.getElementById('section-dom-tree');
    const diagSection = document.getElementById('section-diagnostics');

    if (this.filesSection) this.filesSection.style.display = isSandbox ? 'none' : 'flex';
    if (domSection) domSection.style.display = isSandbox ? 'none' : 'flex';
    if (diagSection) diagSection.style.display = isSandbox ? 'none' : 'flex';

    if (this.paletteSection) {
      this.paletteSection.style.display = isSandbox ? 'flex' : 'none';
      this.paletteSection.style.height = isSandbox ? '100%' : '';
    }

    if (isSandbox) {
      this.loadSandboxCanvas();
      this.app.boundary.showToast('Mode Sandbox Aktif: Tarik komponen untuk mendesain web!');
    } else {
      this.hideFloatingToolbar();
      this.app.fileManager.loadSampleProject();
      this.app.boundary.showToast('Mode Inspector & Color Tuner Aktif');
    }
  }

  renderPalette() {
    if (!this.paletteContainer) return;
    this.paletteContainer.innerHTML = '';

    const categories = {
      containers: { label: 'Containers & Layout', items: [] },
      content: { label: 'Typography & Content', items: [] },
      ui: { label: 'UI Blocks & Buttons', items: [] },
      media: { label: 'Media & Gambar', items: [] }
    };

    Object.entries(COMPONENT_DEFINITIONS).forEach(([id, comp]) => {
      if (categories[comp.category]) {
        categories[comp.category].items.push({ id, ...comp });
      }
    });

    Object.entries(categories).forEach(([catKey, cat]) => {
      if (cat.items.length === 0) return;

      const groupEl = document.createElement('div');
      groupEl.className = 'palette-group';

      const headerEl = document.createElement('div');
      headerEl.className = 'palette-group-header';
      headerEl.textContent = cat.label;
      groupEl.appendChild(headerEl);

      const gridEl = document.createElement('div');
      gridEl.className = 'palette-grid';

      cat.items.forEach(item => {
        const tile = document.createElement('div');
        tile.className = 'palette-item-tile';
        tile.draggable = true;
        tile.dataset.compId = item.id;
        tile.title = item.desc;

        tile.innerHTML = `
          <div class="tile-icon">${item.icon}</div>
          <div class="tile-details">
            <span class="tile-title">${item.name}</span>
            <span class="tile-desc">${item.desc}</span>
          </div>
          <span class="tile-drag-badge">DRAG</span>
        `;

        // Drag Events
        tile.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', item.id);
          e.dataTransfer.effectAllowed = 'copy';
          tile.classList.add('is-dragging');
        });

        tile.addEventListener('dragend', () => {
          tile.classList.remove('is-dragging');
        });

        // Click to append at end
        tile.addEventListener('click', () => {
          this.insertComponentAt(item.id, null);
        });

        gridEl.appendChild(tile);
      });

      groupEl.appendChild(gridEl);
      this.paletteContainer.appendChild(groupEl);
    });
  }

  // Load a rich Starter Sandbox Web Page into preview iframe with inlined styling
  async loadSandboxCanvas() {
    let templateCss = '';
    try {
      const res = await fetch('/css/sandbox-template.css');
      if (res.ok) {
        templateCss = await res.text();
      }
    } catch (e) {
      console.warn('Sandbox CSS fetch warning:', e);
    }

    const starterHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sandbox Project — VisualStyle Studio</title>
  <base href="http://localhost:4200/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
/* Inlined Sandbox Design System */
${templateCss}
  </style>
  <script src="/js/inspector-bridge.js"></script>
</head>
<body class="sandbox-body">
  <div id="sandbox-root" class="sandbox-canvas-root">
    <!-- Navbar -->
    ${COMPONENT_DEFINITIONS['navbar-block'].html}

    <!-- Hero -->
    ${COMPONENT_DEFINITIONS['hero-section'].html}

    <!-- Features -->
    ${COMPONENT_DEFINITIONS['grid-3col'].html}
  </div>
</body>
</html>`;

    const iframe = document.getElementById('preview-iframe');
    if (!iframe) return;

    iframe.srcdoc = starterHtml;

    iframe.onload = () => {
      this.attachCanvasListeners(iframe);
      setTimeout(() => {
        if (this.app && this.app.sendToBridge) {
          this.app.sendToBridge('SET_SELECTOR_THEME', { theme: this.app.selectorThemes[this.app.currentThemeIndex].id });
        }
      }, 100);
    };

    // Update Project Name display in header
    const projDisplay = document.getElementById('project-path-display');
    if (projDisplay) {
      projDisplay.textContent = '✨ Sandbox Canvas (Visual Builder Mode)';
    }

    const urlDisplay = document.getElementById('viewport-url-text');
    if (urlDisplay) {
      urlDisplay.textContent = 'sandbox://starter-canvas.html';
    }
  }

  attachCanvasListeners(iframe) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      this.canvasDoc = doc;
      if (!doc) return;

      const root = doc.getElementById('sandbox-root') || doc.body;

      // 1. Drag & Drop Handlers inside Iframe
      doc.addEventListener('dragover', (e) => {
        if (!this.isActive) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        this.updateDropIndicator(doc, e.clientY);
      });

      doc.addEventListener('dragleave', () => {
        this.hideDropIndicator(doc);
      });

      doc.addEventListener('drop', (e) => {
        if (!this.isActive) return;
        e.preventDefault();
        this.hideDropIndicator(doc);

        const compId = e.dataTransfer.getData('text/plain');
        if (!compId || !COMPONENT_DEFINITIONS[compId]) return;

        const targetEl = doc.elementFromPoint(e.clientX, e.clientY);
        this.insertComponentAt(compId, targetEl);
      });

      // 2. Double Click to Edit Text In-Place
      doc.addEventListener('dblclick', (e) => {
        if (!this.isActive) return;
        const target = e.target;
        if (target.tagName === 'IMG') {
          this.openImagePicker(target);
          return;
        }

        if (['H1', 'H2', 'H3', 'H4', 'P', 'SPAN', 'BUTTON', 'A', 'DIV'].includes(target.tagName)) {
          this.enableInlineEditing(target);
        }
      });

      // 3. Selection change listener
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'ELEMENT_SELECTED' && this.isActive) {
          const sel = event.data.payload ? event.data.payload.selector : null;
          if (sel) {
            try {
              const el = doc.querySelector(sel);
              if (el) this.showFloatingToolbar(el, iframe);
            } catch (err) {}
          }
        }
      });

      // 4. Scroll sync for floating toolbar
      iframe.contentWindow.addEventListener('scroll', () => {
        if (this.selectedElement) {
          this.positionFloatingToolbar(this.selectedElement, iframe);
        }
      }, { passive: true });

    } catch (e) {
      console.warn('Canvas iframe attachment error:', e);
    }
  }

  updateDropIndicator(doc, clientY) {
    let indicator = doc.getElementById('__vs_drop_indicator');
    if (!indicator) {
      indicator = doc.createElement('div');
      indicator.id = '__vs_drop_indicator';
      indicator.style.cssText = `
        position: absolute;
        height: 4px;
        background: #2563eb;
        border-radius: 2px;
        box-shadow: 0 0 10px rgba(37, 99, 235, 0.7);
        pointer-events: none;
        z-index: 2147483647;
        left: 20px;
        right: 20px;
        transition: top 0.08s ease;
      `;
      doc.body.appendChild(indicator);
    }
    indicator.style.display = 'block';
    indicator.style.top = `${clientY + (doc.defaultView.scrollY || 0)}px`;
  }

  hideDropIndicator(doc) {
    const indicator = doc.getElementById('__vs_drop_indicator');
    if (indicator) indicator.style.display = 'none';
  }

  insertComponentAt(compId, targetElement) {
    if (!this.canvasDoc) return;
    const def = COMPONENT_DEFINITIONS[compId];
    if (!def) return;

    const tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = def.html.trim();
    const newElement = tempWrapper.firstElementChild;

    const root = this.canvasDoc.getElementById('sandbox-root') || this.canvasDoc.body;

    if (targetElement && targetElement !== root && targetElement !== this.canvasDoc.body) {
      // Find nearest block container
      const blockParent = targetElement.closest('.vs-comp-block') || targetElement;
      blockParent.parentNode.insertBefore(newElement, blockParent.nextSibling);
    } else {
      root.appendChild(newElement);
    }

    // Scroll to new element and select
    newElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => {
      newElement.click();
      this.app.boundary.showToast(`Komponen "${def.name}" berhasil ditambahkan!`);
    }, 120);
  }

  enableInlineEditing(el) {
    el.contentEditable = 'true';
    el.focus();
    el.style.outline = '2px solid #2563eb';
    el.style.borderRadius = '3px';

    // Select text content
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = this.canvasDoc.defaultView.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    const onBlur = () => {
      el.contentEditable = 'false';
      el.style.outline = 'none';
      el.removeEventListener('blur', onBlur);
      el.removeEventListener('keydown', onKey);
      this.app.boundary.showToast('Teks berhasil diperbarui!');
    };

    const onKey = (e) => {
      if (e.key === 'Enter' && !['P', 'BLOCKQUOTE'].includes(el.tagName)) {
        e.preventDefault();
        el.blur();
      }
      if (e.key === 'Escape') {
        el.blur();
      }
    };

    el.addEventListener('blur', onBlur);
    el.addEventListener('keydown', onKey);
  }

  setupFloatingToolbar() {
    const btnDup = document.getElementById('btn-action-duplicate');
    const btnDel = document.getElementById('btn-action-delete');
    const btnUp = document.getElementById('btn-action-move-up');
    const btnDown = document.getElementById('btn-action-move-down');
    const btnEdit = document.getElementById('btn-action-edit-text');

    if (btnDup) {
      btnDup.addEventListener('click', () => {
        if (!this.selectedElement) return;
        const clone = this.selectedElement.cloneNode(true);
        this.selectedElement.parentNode.insertBefore(clone, this.selectedElement.nextSibling);
        clone.click();
        this.app.boundary.showToast('Elemen berhasil diduplikasi!');
      });
    }

    if (btnDel) {
      btnDel.addEventListener('click', () => {
        if (!this.selectedElement) return;
        const parent = this.selectedElement.parentNode;
        this.selectedElement.style.transition = 'all 0.2s ease';
        this.selectedElement.style.opacity = '0';
        this.selectedElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (this.selectedElement) this.selectedElement.remove();
          this.hideFloatingToolbar();
          this.app.boundary.showToast('Elemen dihapus.');
        }, 200);
      });
    }

    if (btnUp) {
      btnUp.addEventListener('click', () => {
        if (!this.selectedElement || !this.selectedElement.previousElementSibling) return;
        const prev = this.selectedElement.previousElementSibling;
        this.selectedElement.parentNode.insertBefore(this.selectedElement, prev);
        this.positionFloatingToolbar(this.selectedElement, document.getElementById('preview-iframe'));
      });
    }

    if (btnDown) {
      btnDown.addEventListener('click', () => {
        if (!this.selectedElement || !this.selectedElement.nextElementSibling) return;
        const next = this.selectedElement.nextElementSibling;
        this.selectedElement.parentNode.insertBefore(next, this.selectedElement);
        this.positionFloatingToolbar(this.selectedElement, document.getElementById('preview-iframe'));
      });
    }

    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        if (!this.selectedElement) return;
        const textTarget = this.selectedElement.querySelector('h1, h2, h3, h4, p, span, button') || this.selectedElement;
        this.enableInlineEditing(textTarget);
      });
    }
  }

  showFloatingToolbar(el, iframe) {
    this.selectedElement = el;
    if (!this.floatingToolbar || !iframe) return;

    this.positionFloatingToolbar(el, iframe);
    this.floatingToolbar.style.display = 'flex';
  }

  positionFloatingToolbar(el, iframe) {
    if (!this.floatingToolbar || !el || !iframe) return;

    const elRect = el.getBoundingClientRect();
    const iframeRect = iframe.getBoundingClientRect();

    const top = iframeRect.top + elRect.top - 38;
    const left = iframeRect.left + elRect.left + (elRect.width / 2) - (this.floatingToolbar.offsetWidth / 2);

    this.floatingToolbar.style.top = `${Math.max(iframeRect.top + 4, top)}px`;
    this.floatingToolbar.style.left = `${Math.max(iframeRect.left + 8, left)}px`;
  }

  hideFloatingToolbar() {
    if (this.floatingToolbar) this.floatingToolbar.style.display = 'none';
    this.selectedElement = null;
  }

  // Image Picker Modal
  setupImageModal() {
    const closeBtn = document.getElementById('btn-close-image-modal');
    const applyBtn = document.getElementById('btn-apply-image-url');
    const inputUrl = document.getElementById('input-custom-image-url');
    const presetsGrid = document.getElementById('image-presets-grid');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeImagePicker());

    if (applyBtn && inputUrl) {
      applyBtn.addEventListener('click', () => {
        const url = inputUrl.value.trim();
        if (url && this.currentImgTarget) {
          this.currentImgTarget.src = url;
          this.closeImagePicker();
          this.app.boundary.showToast('Gambar berhasil diperbarui!');
        }
      });
    }

    if (presetsGrid) {
      const presets = [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
      ];

      presetsGrid.innerHTML = '';
      presets.forEach(src => {
        const imgThumb = document.createElement('img');
        imgThumb.src = src;
        imgThumb.className = 'preset-thumb-img';
        imgThumb.addEventListener('click', () => {
          if (this.currentImgTarget) {
            this.currentImgTarget.src = src;
            this.closeImagePicker();
            this.app.boundary.showToast('Gambar dipilih dari katalog preset!');
          }
        });
        presetsGrid.appendChild(imgThumb);
      });
    }
  }

  openImagePicker(imgElement) {
    this.currentImgTarget = imgElement;
    if (this.imageModal) {
      this.imageModal.style.display = 'flex';
      const inputUrl = document.getElementById('input-custom-image-url');
      if (inputUrl) inputUrl.value = imgElement.src || '';
    }
  }

  closeImagePicker() {
    if (this.imageModal) this.imageModal.style.display = 'none';
    this.currentImgTarget = null;
  }

  // Export current canvas as Clean Standalone HTML + CSS
  exportCanvasHtml() {
    if (!this.canvasDoc) return '';
    const root = this.canvasDoc.getElementById('sandbox-root');
    const content = root ? root.innerHTML : this.canvasDoc.body.innerHTML;
    const styles = this.app.getAggregatedCss();

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Dibuat dengan VisualStyle Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="custom-styles.css">
  <style>
${styles}
  </style>
</head>
<body class="sandbox-body">
  <div class="sandbox-canvas-root">
${content}
  </div>
</body>
</html>`;
  }
}
