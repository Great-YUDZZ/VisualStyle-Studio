/**
 * VisualStyle Studio — Core Orchestrator (app.js)
 * Coordinates all modules, handles viewport resize, inspect overlay, keyboard shortcuts,
 * and live bridge messaging.
 */

import { BoundaryManager } from './toast-boundary.js';
import { FileManager } from './file-manager.js';
import { DomTreeManager } from './dom-tree.js';
import { ColorTuner } from './color-tuner.js';
import { AnimationInjector } from './anim-injector.js';
import { ViewportResizer } from './viewport-resizer.js';
import { SandboxBuilder } from './sandbox-builder.js';

class VisualStyleStudioApp {
  constructor() {
    this.isInspectMode = true;
    this.selectedElement = null;
    this.currentViewportPreset = 'desktop';

    // Initialize Subsystems
    this.boundary = new BoundaryManager();
    this.fileManager = new FileManager(this);
    this.domTree = new DomTreeManager(this);
    this.colorTuner = new ColorTuner(this);
    this.animInjector = new AnimationInjector(this);
    this.viewportResizer = new ViewportResizer(this);
    this.sandboxBuilder = new SandboxBuilder(this);

    // Cache Elements
    this.iframe = document.getElementById('preview-iframe');
    this.viewportFrame = document.getElementById('viewport-frame');
    this.boundingHighlight = document.getElementById('bounding-highlight');
    this.boundingTooltip = document.getElementById('bounding-tooltip');
    this.inspectToggleBtn = document.getElementById('btn-toggle-inspect');
    this.generatedCssBox = document.getElementById('generated-css-code');
    this.copyCssBtn = document.getElementById('btn-copy-css');

    // Telemetry Elements
    this.statusActiveEl = document.getElementById('status-active-element');
    this.statusOffsetEl = document.getElementById('status-cursor-offset');
    this.statusLatencyEl = document.getElementById('status-latency');
    this.statusFpsEl = document.getElementById('status-fps');

    // Selector Color Themes
    this.selectorThemes = [
      { id: 'rainbow', label: '🌈 Rainbow Flow', dotClass: 'rainbow-dot' },
      { id: 'cyan', label: '⚡ Neon Cyan', dotClass: 'cyan-dot' },
      { id: 'magenta', label: '🔥 Neon Pink', dotClass: 'magenta-dot' },
      { id: 'emerald', label: '🟢 Emerald', dotClass: 'emerald-dot' },
      { id: 'amber', label: '🟡 Amber', dotClass: 'amber-dot' }
    ];
    this.currentThemeIndex = 0;

    this.init();
  }

  init() {
    this.setupWindowBridge();
    this.setupViewportControls();
    this.setupInspectorTabs();
    this.setupGlobalActions();
    this.setupShortcuts();
    this.startFpsMeter();

    // Auto-load sample project on startup
    this.fileManager.loadSampleProject();
  }

  setupWindowBridge() {
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data || data.source !== 'VISUALSTYLE_BRIDGE') return;

      const startTime = performance.now();

      switch (data.type) {
        case 'PREVIEW_READY':
          this.domTree.renderDomTree(data.payload.domTree);
          // Set initial selector theme
          this.sendToBridge('SET_SELECTOR_THEME', { theme: this.selectorThemes[this.currentThemeIndex].id });
          break;

        case 'ELEMENT_HOVER':
          // Hover overlay is rendered with pixel-perfection directly inside the iframe bridge
          break;

        case 'ELEMENT_SELECTED':
          this.onElementSelected(data.payload);
          break;
      }

      const latency = (performance.now() - startTime).toFixed(1);
      if (this.statusLatencyEl) {
        this.statusLatencyEl.textContent = `Latency: ${latency}ms`;
      }
    });
  }

  sendToBridge(action, payload = {}) {
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage({
        target: 'VISUALSTYLE_BRIDGE',
        action,
        ...payload
      }, '*');
    }
  }

  onElementSelected(payload) {
    this.selectedElement = payload;

    // Update Diagnostics & Navigation
    this.domTree.updateDiagnostics(payload);
    this.domTree.updateBreadcrumbs(payload.breadcrumbs, payload.selector);
    this.domTree.renderDomTree(null, payload.selector); // Refresh active row

    // Populate Editors
    this.colorTuner.loadElement(payload);
    this.animInjector.loadElement(payload);

    // Update Status Bar
    if (this.statusActiveEl) {
      this.statusActiveEl.textContent = `Active: <${payload.tag}${payload.id ? '#' + payload.id : ''}${payload.classes.length ? '.' + payload.classes[0] : ''}>`;
    }
    if (this.statusOffsetEl && payload.rect) {
      this.statusOffsetEl.textContent = `Offset: X: ${payload.rect.left}px • Y: ${payload.rect.top}px`;
    }

    this.updateGeneratedCssView();
  }

  selectBySelector(selector) {
    this.sendToBridge('SELECT_BY_SELECTOR', { selector });
  }

  setupViewportControls() {
    const themeCycleBtn = document.getElementById('btn-selector-theme-cycle');
    const themeDot = document.getElementById('selector-theme-dot');
    const themeText = document.getElementById('selector-theme-text');

    // Dynamic Selector Color Theme Cycle Button
    if (themeCycleBtn) {
      themeCycleBtn.addEventListener('click', () => {
        this.currentThemeIndex = (this.currentThemeIndex + 1) % this.selectorThemes.length;
        const currentTheme = this.selectorThemes[this.currentThemeIndex];
        
        if (themeDot) {
          themeDot.className = `theme-dot ${currentTheme.dotClass}`;
        }
        if (themeText) {
          themeText.textContent = currentTheme.label;
        }

        this.sendToBridge('SET_SELECTOR_THEME', { theme: currentTheme.id });
        this.boundary.showToast(`Warna Selector: ${currentTheme.label}`);
      });
    }

    // Inspect Toggle
    if (this.inspectToggleBtn) {
      this.inspectToggleBtn.addEventListener('click', () => {
        this.isInspectMode = !this.isInspectMode;
        this.inspectToggleBtn.classList.toggle('active', this.isInspectMode);
        this.sendToBridge('SET_INSPECT_MODE', { enabled: this.isInspectMode });
      });
    }
  }

  setupInspectorTabs() {
    const tabColor = document.getElementById('tab-btn-color');
    const tabAnim = document.getElementById('tab-btn-anim');
    const contentColor = document.getElementById('tab-content-color');
    const contentAnim = document.getElementById('tab-content-anim');

    if (tabColor && tabAnim) {
      tabColor.addEventListener('click', () => {
        tabColor.classList.add('active');
        tabAnim.classList.remove('active');
        if (contentColor) contentColor.classList.add('active');
        if (contentAnim) contentAnim.classList.remove('active');
      });

      tabAnim.addEventListener('click', () => {
        tabAnim.classList.add('active');
        tabColor.classList.remove('active');
        if (contentAnim) contentAnim.classList.add('active');
        if (contentColor) contentColor.classList.remove('active');
      });
    }
  }

  setupGlobalActions() {
    const openFolderBtn = document.getElementById('btn-open-folder');
    if (openFolderBtn) {
      openFolderBtn.addEventListener('click', () => this.fileManager.openFolder());
    }

    const emptyLoadSampleBtn = document.getElementById('btn-empty-load-sample');
    if (emptyLoadSampleBtn) {
      emptyLoadSampleBtn.addEventListener('click', () => this.fileManager.loadSampleProject());
    }

    const saveBtn = document.getElementById('btn-save-changes');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (this.sandboxBuilder && this.sandboxBuilder.isActive) {
          const html = this.sandboxBuilder.exportCanvasHtml();
          const css = this.getAggregatedCss();
          this.fileManager.saveSandboxToDisk(html, css);
        } else {
          const fullCss = this.getAggregatedCss();
          this.fileManager.saveChangesToDisk(fullCss);
        }
      });
    }

    const exportBtn = document.getElementById('btn-export-css');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (this.sandboxBuilder && this.sandboxBuilder.isActive) {
          const html = this.sandboxBuilder.exportCanvasHtml();
          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'sandbox-page.html';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          this.boundary.showToast('File sandbox-page.html berhasil diunduh!');
        } else {
          const fullCss = this.getAggregatedCss();
          this.fileManager.exportCssFile(fullCss);
        }
      });
    }

    if (this.copyCssBtn) {
      this.copyCssBtn.addEventListener('click', () => {
        const css = this.getAggregatedCss();
        navigator.clipboard.writeText(css).then(() => {
          this.boundary.showToast('CSS berhasil disalin ke clipboard!');
        });
      });
    }
  }

  setupShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl + S (or Cmd + S) -> Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (this.sandboxBuilder && this.sandboxBuilder.isActive) {
          const html = this.sandboxBuilder.exportCanvasHtml();
          const css = this.getAggregatedCss();
          this.fileManager.saveSandboxToDisk(html, css);
        } else {
          const fullCss = this.getAggregatedCss();
          this.fileManager.saveChangesToDisk(fullCss);
        }
      }
      // Esc -> Clear selection / Toggle Inspect
      if (e.key === 'Escape') {
        if (this.boundingHighlight) this.boundingHighlight.style.display = 'none';
        this.selectedElement = null;
      }
    });
  }

  getAggregatedCss() {
    const colorCss = this.colorTuner.getAllGeneratedCss();
    const animCss = this.animInjector.getAllGeneratedCss();
    return `/* Generated by VisualStyle Studio — ${new Date().toLocaleString()} */\n\n` + 
           colorCss + '\n\n' + animCss;
  }

  updateGeneratedCssView() {
    if (!this.generatedCssBox) return;
    const css = this.getAggregatedCss();
    this.generatedCssBox.textContent = css.trim() || '/* Belum ada perubahan styling atau animasi */';
  }

  startFpsMeter() {
    let frameCount = 0;
    let lastTime = performance.now();

    const loop = (now) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        if (this.statusFpsEl) {
          this.statusFpsEl.textContent = `${fps}.0 FPS`;
        }
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Instantiate on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.__visualStyleApp = new VisualStyleStudioApp();
  window.__vs_app = window.__visualStyleApp;
});
