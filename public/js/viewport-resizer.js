/**
 * VisualStyle Studio — Viewport Resizer & Responsive Canvas Engine
 * Powers interactive edge/corner dragging, custom W x H input sync,
 * device presets (Mobile, Tablet, Desktop, Fluid), orientation flipping, and canvas zooming.
 */

export class ViewportResizer {
  constructor(app) {
    this.app = app;
    this.frame = document.getElementById('viewport-frame');
    this.stage = document.querySelector('.artboard-stage');

    // Inputs & Toolbar Controls
    this.inputW = document.getElementById('viewport-input-w');
    this.inputH = document.getElementById('viewport-input-h');
    this.btnFlip = document.getElementById('btn-orientation-flip');
    this.selectZoom = document.getElementById('select-canvas-zoom');
    this.dimBadge = document.getElementById('viewport-dim-badge');

    // Preset Buttons
    this.btnDesktop = document.getElementById('btn-preset-desktop');
    this.btnTablet = document.getElementById('btn-preset-tablet');
    this.btnMobile = document.getElementById('btn-preset-mobile');
    this.btnFluid = document.getElementById('btn-preset-fluid');

    // Resizer Handles
    this.handleE = document.getElementById('resizer-handle-e');
    this.handleS = document.getElementById('resizer-handle-s');
    this.handleSE = document.getElementById('resizer-handle-se');

    this.currentPreset = 'desktop';
    this.width = 1200;
    this.height = 780;
    this.zoom = 1;
    this.isDragging = false;
    this.activeHandle = null;

    this.init();
  }

  init() {
    this.setupPresetButtons();
    this.setupInputListeners();
    this.setupOrientationFlip();
    this.setupZoomControl();
    this.setupDragHandles();

    // Initial size sync
    this.applySize(1200, 780, 'desktop');
  }

  setupPresetButtons() {
    const presets = [
      { btn: this.btnDesktop, id: 'desktop', w: 1200, h: 780 },
      { btn: this.btnTablet, id: 'tablet', w: 768, h: 1024 },
      { btn: this.btnMobile, id: 'mobile', w: 375, h: 667 },
      { btn: this.btnFluid, id: 'fluid', w: '100%', h: '96%' }
    ];

    presets.forEach(({ btn, id, w, h }) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        presets.forEach(p => p.btn && p.btn.classList.remove('active'));
        btn.classList.add('active');
        this.currentPreset = id;
        this.applySize(w, h, id);
      });
    });
  }

  setupInputListeners() {
    const updateFromInputs = () => {
      let w = parseInt(this.inputW.value, 10);
      let h = parseInt(this.inputH.value, 10);

      if (isNaN(w) || w < 280) w = 375;
      if (w > 2560) w = 2560;

      if (isNaN(h) || h < 200) h = 400;
      if (h > 2160) h = 2160;

      this.currentPreset = 'custom';
      this.clearPresetActiveButtons();
      this.applySize(w, h, 'custom');
    };

    if (this.inputW) {
      this.inputW.addEventListener('change', updateFromInputs);
      this.inputW.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') updateFromInputs();
      });
    }

    if (this.inputH) {
      this.inputH.addEventListener('change', updateFromInputs);
      this.inputH.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') updateFromInputs();
      });
    }
  }

  setupOrientationFlip() {
    if (!this.btnFlip) return;
    this.btnFlip.addEventListener('click', () => {
      const currentW = typeof this.width === 'number' ? this.width : this.frame.offsetWidth;
      const currentH = typeof this.height === 'number' ? this.height : this.frame.offsetHeight;

      // Swap
      const newW = currentH;
      const newH = currentW;

      this.currentPreset = 'custom';
      this.clearPresetActiveButtons();
      this.applySize(newW, newH, 'custom');

      this.app.boundary.showToast(`Orientasi ditukar: ${newW} × ${newH} px`);
    });
  }

  setupZoomControl() {
    if (!this.selectZoom) return;
    this.selectZoom.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'fit') {
        this.fitToScreen();
      } else {
        const factor = parseFloat(val);
        this.setZoom(factor);
      }
    });
  }

  setZoom(factor) {
    this.zoom = factor;
    if (this.frame) {
      this.frame.style.transform = factor === 1 ? 'none' : `scale(${factor})`;
      this.frame.style.transformOrigin = 'center center';
    }
  }

  fitToScreen() {
    if (!this.frame || !this.stage) return;
    const stageW = this.stage.clientWidth - 80;
    const stageH = this.stage.clientHeight - 80;
    const frameW = this.frame.offsetWidth;
    const frameH = this.frame.offsetHeight;

    const scaleW = stageW / frameW;
    const scaleH = stageH / frameH;
    const scale = Math.min(1, Math.min(scaleW, scaleH));

    this.setZoom(Math.max(0.4, Number(scale.toFixed(2))));
    if (this.selectZoom) {
      this.selectZoom.value = 'fit';
    }
  }

  setupDragHandles() {
    const startDrag = (handleType, e) => {
      e.preventDefault();
      e.stopPropagation();

      this.isDragging = true;
      this.activeHandle = handleType;
      this.currentPreset = 'custom';
      this.clearPresetActiveButtons();

      const startX = e.clientX;
      const startY = e.clientY;
      const startW = this.frame.offsetWidth;
      const startH = this.frame.offsetHeight;

      document.body.classList.add('is-resizing-viewport');
      if (this.dimBadge) this.dimBadge.style.display = 'block';

      const onMouseMove = (moveEvent) => {
        if (!this.isDragging) return;
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let newW = startW;
        let newH = startH;

        if (this.activeHandle === 'e' || this.activeHandle === 'se') {
          newW = Math.max(320, Math.min(2400, startW + deltaX * 2)); // Centered frame scales equally
        }
        if (this.activeHandle === 's' || this.activeHandle === 'se') {
          newH = Math.max(300, Math.min(1800, startH + deltaY));
        }

        this.applySize(Math.round(newW), Math.round(newH), 'custom', false);
      };

      const onMouseUp = () => {
        this.isDragging = false;
        this.activeHandle = null;
        document.body.classList.remove('is-resizing-viewport');
        if (this.dimBadge) this.dimBadge.style.display = 'none';

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        // Notify bridge to recalculate bounding rects
        this.app.sendToBridge('SET_INSPECT_MODE', { enabled: this.app.isInspectMode });
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    if (this.handleE) this.handleE.addEventListener('mousedown', (e) => startDrag('e', e));
    if (this.handleS) this.handleS.addEventListener('mousedown', (e) => startDrag('s', e));
    if (this.handleSE) this.handleSE.addEventListener('mousedown', (e) => startDrag('se', e));
  }

  applySize(w, h, preset = 'custom', smooth = true) {
    this.width = w;
    this.height = h;

    if (!this.frame) return;

    if (smooth) {
      this.frame.style.transition = 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      this.frame.style.transition = 'none';
    }

    if (preset === 'desktop') {
      this.frame.style.width = '100%';
      this.frame.style.maxWidth = '1200px';
      this.frame.style.height = '95%';
      this.frame.style.maxHeight = '780px';
      this.frame.style.flexShrink = '1';
      if (this.inputW) this.inputW.value = 1200;
      if (this.inputH) this.inputH.value = 780;
    } else if (preset === 'fluid') {
      this.frame.style.width = '100%';
      this.frame.style.maxWidth = '100%';
      this.frame.style.height = '96%';
      this.frame.style.maxHeight = '100%';
      this.frame.style.flexShrink = '1';
      if (this.inputW) this.inputW.value = this.frame.offsetWidth || 1200;
      if (this.inputH) this.inputH.value = this.frame.offsetHeight || 780;
    } else if (preset === 'tablet') {
      this.frame.style.width = '768px';
      this.frame.style.maxWidth = '768px';
      this.frame.style.height = '85%';
      this.frame.style.maxHeight = '1024px';
      this.frame.style.flexShrink = '0';
      if (this.inputW) this.inputW.value = 768;
      if (this.inputH) this.inputH.value = 1024;
    } else if (preset === 'mobile') {
      this.frame.style.width = '375px';
      this.frame.style.maxWidth = '375px';
      this.frame.style.height = '667px';
      this.frame.style.maxHeight = '667px';
      this.frame.style.flexShrink = '0';
      if (this.inputW) this.inputW.value = 375;
      if (this.inputH) this.inputH.value = 667;
    } else {
      if (typeof w === 'number') {
        this.frame.style.width = `${w}px`;
        this.frame.style.maxWidth = `${w}px`;
        if (this.inputW) this.inputW.value = w;
      }
      if (typeof h === 'number') {
        this.frame.style.height = `${h}px`;
        this.frame.style.maxHeight = `${h}px`;
        if (this.inputH) this.inputH.value = h;
      }
      this.frame.style.flexShrink = '0';
    }

    // Update floating dimension badge
    if (this.dimBadge) {
      const realW = typeof w === 'number' ? w : this.frame.offsetWidth;
      const realH = typeof h === 'number' ? h : this.frame.offsetHeight;
      this.dimBadge.textContent = `${realW} × ${realH} px`;
    }

    // Refresh overlay alignment
    setTimeout(() => {
      this.app.sendToBridge('SET_INSPECT_MODE', { enabled: this.app.isInspectMode });
    }, smooth ? 260 : 20);
  }

  clearPresetActiveButtons() {
    [this.btnDesktop, this.btnTablet, this.btnMobile, this.btnFluid].forEach(b => {
      if (b) b.classList.remove('active');
    });
  }
}
