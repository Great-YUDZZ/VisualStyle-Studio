/**
 * VisualStyle Studio — Gradient Tuner & Designer Engine (gradient-tuner.js)
 * High-precision multi-stop gradient synthesis: Solid, Linear, and Radial.
 * Interactive visual ramp track, draggable color stop pins, rotary angle dial,
 * curated studio presets, and real-time DOM/CSS injection.
 */

export class GradientTuner {
  constructor(app, colorTuner) {
    this.app = app;
    this.colorTuner = colorTuner;

    // Gradient State
    this.fillType = 'solid'; // 'solid' | 'linear' | 'radial'
    this.targetMode = 'background'; // 'background' | 'text'
    this.angle = 135;
    this.radialShape = 'circle at center';
    this.stops = [
      { color: '#2563EB', position: 0, opacity: 1 },
      { color: '#10B981', position: 100, opacity: 1 }
    ];
    this.activeStopIndex = 0;

    // Curated Presets
    this.presets = [
      { name: 'Hyper Blue', type: 'linear', angle: 135, stops: [{ color: '#2563EB', position: 0, opacity: 1 }, { color: '#06B6D4', position: 100, opacity: 1 }] },
      { name: 'Emerald Glow', type: 'linear', angle: 135, stops: [{ color: '#10B981', position: 0, opacity: 1 }, { color: '#047857', position: 100, opacity: 1 }] },
      { name: 'Sunset Radiance', type: 'linear', angle: 135, stops: [{ color: '#F97316', position: 0, opacity: 1 }, { color: '#EC4899', position: 100, opacity: 1 }] },
      { name: 'Violet Neon', type: 'linear', angle: 135, stops: [{ color: '#8B5CF6', position: 0, opacity: 1 }, { color: '#D946EF', position: 100, opacity: 1 }] },
      { name: 'Ocean Azure', type: 'linear', angle: 135, stops: [{ color: '#0284C7', position: 0, opacity: 1 }, { color: '#2563EB', position: 100, opacity: 1 }] },
      { name: 'Peach Breeze', type: 'linear', angle: 135, stops: [{ color: '#FB7185', position: 0, opacity: 1 }, { color: '#F59E0B', position: 100, opacity: 1 }] },
      { name: 'Dark Slate', type: 'linear', angle: 135, stops: [{ color: '#334155', position: 0, opacity: 1 }, { color: '#0F172A', position: 100, opacity: 1 }] },
      { name: 'Frosted Pearl', type: 'linear', angle: 135, stops: [{ color: '#F8FAFC', position: 0, opacity: 1 }, { color: '#E2E8F0', position: 100, opacity: 1 }] }
    ];

    this.cacheDom();
    this.bindEvents();
    this.renderPresets();
    this.renderRamp();
  }

  cacheDom() {
    // Fill Mode Tabs & Titles
    this.fillSectionTitle = document.getElementById('fill-section-title');
    this.tabSolid = document.getElementById('fill-tab-solid');
    this.tabLinear = document.getElementById('fill-tab-linear');
    this.tabRadial = document.getElementById('fill-tab-radial');
    this.viewSolid = document.getElementById('fill-view-solid');
    this.viewGradient = document.getElementById('fill-view-gradient');

    // Fill Target Switcher
    this.btnTargetBg = document.getElementById('fill-target-bg');
    this.btnTargetText = document.getElementById('fill-target-text');
    this.targetNoticeText = document.getElementById('fill-target-banner-text');

    // Ramp elements
    this.rampTrack = document.getElementById('gradient-ramp-track');
    this.rampPins = document.getElementById('gradient-ramp-pins');
    this.stopsCountBadge = document.getElementById('gradient-stops-count');

    // Stop Card elements
    this.stopBadge = document.getElementById('gradient-stop-badge');
    this.btnAddStop = document.getElementById('btn-add-gradient-stop');
    this.btnDeleteStop = document.getElementById('btn-delete-gradient-stop');
    this.stopColorPicker = document.getElementById('gradient-stop-color-picker');
    this.stopColorText = document.getElementById('gradient-stop-color-text');
    this.stopPosSlider = document.getElementById('gradient-stop-pos-slider');
    this.stopPosInput = document.getElementById('gradient-stop-pos-input');
    this.posValBadge = document.getElementById('gradient-pos-val');
    this.stopOpacitySlider = document.getElementById('gradient-stop-opacity-slider');
    this.stopOpacityInput = document.getElementById('gradient-stop-opacity-input');
    this.opacityValBadge = document.getElementById('gradient-opacity-val');

    // Direction & Angle elements
    this.linearControls = document.getElementById('gradient-linear-controls');
    this.radialControls = document.getElementById('gradient-radial-controls');
    this.angleBadge = document.getElementById('gradient-angle-badge');
    this.angleDial = document.getElementById('gradient-angle-dial');
    this.dialNeedle = document.getElementById('gradient-dial-needle');
    this.angleInput = document.getElementById('gradient-angle-input');
    this.btnFlip = document.getElementById('btn-gradient-flip');

    // Presets Grid
    this.presetsGrid = document.getElementById('gradient-presets-grid');
    this.btnCopyGradientRule = document.getElementById('btn-copy-gradient-rule');
  }

  bindEvents() {
    // Fill Target Switcher
    if (this.btnTargetBg) {
      this.btnTargetBg.addEventListener('click', () => this.setTargetMode('background'));
    }
    if (this.btnTargetText) {
      this.btnTargetText.addEventListener('click', () => this.setTargetMode('text'));
    }

    // Fill mode switcher
    if (this.tabSolid) {
      this.tabSolid.addEventListener('click', () => this.setFillType('solid'));
    }
    if (this.tabLinear) {
      this.tabLinear.addEventListener('click', () => this.setFillType('linear'));
    }
    if (this.tabRadial) {
      this.tabRadial.addEventListener('click', () => this.setFillType('radial'));
    }

    // Click on ramp track to add a stop
    if (this.rampTrack) {
      this.rampTrack.addEventListener('click', (e) => {
        const rect = this.rampTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.round(Math.max(0, Math.min(100, (clickX / rect.width) * 100)));
        this.addStop(percent);
      });
    }

    // Add Stop button
    if (this.btnAddStop) {
      this.btnAddStop.addEventListener('click', () => {
        let newPos = 50;
        if (this.stops.length >= 2) {
          const s1 = this.stops[this.activeStopIndex] || this.stops[0];
          newPos = Math.min(100, s1.position + 20);
        }
        this.addStop(newPos);
      });
    }

    // Delete Stop button
    if (this.btnDeleteStop) {
      this.btnDeleteStop.addEventListener('click', () => {
        this.deleteStop(this.activeStopIndex);
      });
    }

    // Stop Color picker & text
    if (this.stopColorPicker) {
      this.stopColorPicker.addEventListener('input', (e) => {
        const hex = e.target.value;
        if (this.stopColorText) this.stopColorText.value = hex;
        this.updateActiveStop({ color: hex });
      });
    }
    if (this.stopColorText) {
      this.stopColorText.addEventListener('input', (e) => {
        let hex = e.target.value.trim();
        if (!hex.startsWith('#') && /^[0-9a-fA-F]{3,6}$/.test(hex)) {
          hex = '#' + hex;
        }
        if (/^#[0-9a-fA-F]{6}$/i.test(hex)) {
          if (this.stopColorPicker) this.stopColorPicker.value = hex;
        }
        this.updateActiveStop({ color: hex });
      });
    }

    // Stop Position Slider & Input
    if (this.stopPosSlider) {
      this.stopPosSlider.addEventListener('input', (e) => {
        const pos = parseInt(e.target.value, 10);
        if (this.stopPosInput) this.stopPosInput.value = pos;
        if (this.posValBadge) this.posValBadge.textContent = `${pos}%`;
        this.updateActiveStop({ position: pos }, false);
      });
      this.stopPosSlider.addEventListener('change', () => {
        this.sortStops();
        this.renderRamp();
        this.applyCurrentGradient();
      });
    }
    if (this.stopPosInput) {
      this.stopPosInput.addEventListener('input', (e) => {
        let pos = parseInt(e.target.value, 10) || 0;
        pos = Math.max(0, Math.min(100, pos));
        if (this.stopPosSlider) this.stopPosSlider.value = pos;
        if (this.posValBadge) this.posValBadge.textContent = `${pos}%`;
        this.updateActiveStop({ position: pos });
      });
    }

    // Stop Opacity Slider & Input
    if (this.stopOpacitySlider) {
      this.stopOpacitySlider.addEventListener('input', (e) => {
        const opVal = parseInt(e.target.value, 10);
        if (this.stopOpacityInput) this.stopOpacityInput.value = opVal;
        if (this.opacityValBadge) this.opacityValBadge.textContent = `${opVal}%`;
        this.updateActiveStop({ opacity: opVal / 100 });
      });
    }
    if (this.stopOpacityInput) {
      this.stopOpacityInput.addEventListener('input', (e) => {
        let opVal = parseInt(e.target.value, 10) || 0;
        opVal = Math.max(0, Math.min(100, opVal));
        if (this.stopOpacitySlider) this.stopOpacitySlider.value = opVal;
        if (this.opacityValBadge) this.opacityValBadge.textContent = `${opVal}%`;
        this.updateActiveStop({ opacity: opVal / 100 });
      });
    }

    // Direction & Angle input
    if (this.angleInput) {
      this.angleInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10) || 0;
        val = ((val % 360) + 360) % 360;
        this.setAngle(val);
      });
    }

    // Flip button
    if (this.btnFlip) {
      this.btnFlip.addEventListener('click', () => {
        this.setAngle((this.angle + 180) % 360);
      });
    }

    // Angle Preset chips
    document.querySelectorAll('.angle-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const deg = parseInt(chip.getAttribute('data-angle'), 10);
        this.setAngle(deg);
      });
    });

    // Radial Preset chips
    document.querySelectorAll('.radial-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const shape = chip.getAttribute('data-radial');
        this.setRadialShape(shape);
        document.querySelectorAll('.radial-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    // Rotary Dial Interaction
    if (this.angleDial) {
      let isDraggingDial = false;
      const updateDialFromEvent = (e) => {
        const rect = this.angleDial.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        // In CSS, 0deg is to top (-Y), 90deg is to right (+X)
        let radians = Math.atan2(dx, -dy);
        let degrees = Math.round(radians * (180 / Math.PI));
        if (degrees < 0) degrees += 360;
        this.setAngle(degrees);
      };

      this.angleDial.addEventListener('mousedown', (e) => {
        isDraggingDial = true;
        updateDialFromEvent(e);
        const onMouseMove = (ev) => {
          if (isDraggingDial) updateDialFromEvent(ev);
        };
        const onMouseUp = () => {
          isDraggingDial = false;
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    }

    // Copy gradient rule button
    if (this.btnCopyGradientRule) {
      this.btnCopyGradientRule.addEventListener('click', () => {
        this.copyGradientCss();
      });
    }
  }

  setFillType(type) {
    this.fillType = type;

    // Update Tab states
    [this.tabSolid, this.tabLinear, this.tabRadial].forEach(tab => tab?.classList.remove('active'));
    if (type === 'solid') this.tabSolid?.classList.add('active');
    if (type === 'linear') this.tabLinear?.classList.add('active');
    if (type === 'radial') this.tabRadial?.classList.add('active');

    if (type === 'solid') {
      if (this.viewSolid) this.viewSolid.classList.add('active');
      if (this.viewGradient) this.viewGradient.classList.remove('active');

      if (this.targetMode === 'text') {
        const currentText = this.colorTuner.colorText ? this.colorTuner.colorText.value : '#0f172a';
        this.colorTuner.updateProperty('background', null); // remove gradient
        this.colorTuner.updateProperty('color', currentText);
        this.colorTuner.setTextGradientMode(false);
      } else {
        // Revert from gradient to solid background color
        const currentBg = this.colorTuner.bgText ? this.colorTuner.bgText.value : '#2563eb';
        this.colorTuner.updateProperty('background', null); // remove gradient override
        this.colorTuner.updateProperty('backgroundColor', currentBg);
      }
    } else {
      if (this.viewSolid) this.viewSolid.classList.remove('active');
      if (this.viewGradient) this.viewGradient.classList.add('active');

      if (this.targetMode === 'text') {
        this.colorTuner.setTextGradientMode(true);
      }

      // Toggle Linear vs Radial sub-controls
      if (type === 'linear') {
        if (this.linearControls) this.linearControls.style.display = 'block';
        if (this.radialControls) this.radialControls.style.display = 'none';
      } else {
        if (this.linearControls) this.linearControls.style.display = 'none';
        if (this.radialControls) this.radialControls.style.display = 'block';
      }

      this.renderRamp();
      this.applyCurrentGradient();
    }
  }

  setAngle(deg) {
    this.angle = deg;
    if (this.angleBadge) this.angleBadge.textContent = `${deg}°`;
    if (this.angleInput) this.angleInput.value = deg;
    if (this.dialNeedle) {
      this.dialNeedle.style.transform = `rotate(${deg}deg)`;
    }

    // Update active state on preset chips
    document.querySelectorAll('.angle-chip').forEach(chip => {
      const chipAngle = parseInt(chip.getAttribute('data-angle'), 10);
      chip.classList.toggle('active', chipAngle === deg);
    });

    this.renderRamp();
    this.applyCurrentGradient();
  }

  setRadialShape(shape) {
    this.radialShape = shape;
    this.renderRamp();
    this.applyCurrentGradient();
  }

  addStop(position = 50, color = null) {
    if (!color) {
      // Pick color between existing stops or default
      color = this.stops[this.activeStopIndex]?.color || '#3b82f6';
    }

    const newStop = {
      color,
      position: Math.max(0, Math.min(100, position)),
      opacity: 1
    };

    this.stops.push(newStop);
    this.sortStops();

    // Select the new stop
    this.activeStopIndex = this.stops.indexOf(newStop);
    this.renderRamp();
    this.selectStop(this.activeStopIndex);
    this.applyCurrentGradient();

    this.app.boundary?.toast?.show('success', `Color stop baru ditambahkan pada ${newStop.position}%`);
  }

  deleteStop(index) {
    if (this.stops.length <= 2) {
      this.app.boundary?.toast?.show('error', 'Minimal harus terdapat 2 color stop pada gradien');
      return;
    }

    this.stops.splice(index, 1);
    this.activeStopIndex = Math.max(0, index - 1);
    this.sortStops();
    this.renderRamp();
    this.selectStop(this.activeStopIndex);
    this.applyCurrentGradient();

    this.app.boundary?.toast?.show('success', 'Color stop berhasil dihapus');
  }

  sortStops() {
    this.stops.sort((a, b) => a.position - b.position);
  }

  selectStop(index) {
    this.activeStopIndex = index;
    const stop = this.stops[index];
    if (!stop) return;

    if (this.stopBadge) {
      this.stopBadge.textContent = `Stop ${index + 1} of ${this.stops.length} (Active)`;
    }

    // Sync Color
    if (this.stopColorPicker) this.stopColorPicker.value = stop.color.slice(0, 7);
    if (this.stopColorText) this.stopColorText.value = stop.color;

    // Sync Position
    if (this.stopPosSlider) this.stopPosSlider.value = stop.position;
    if (this.stopPosInput) this.stopPosInput.value = stop.position;
    if (this.posValBadge) this.posValBadge.textContent = `${stop.position}%`;

    // Sync Opacity
    const opacityPct = Math.round((stop.opacity ?? 1) * 100);
    if (this.stopOpacitySlider) this.stopOpacitySlider.value = opacityPct;
    if (this.stopOpacityInput) this.stopOpacityInput.value = opacityPct;
    if (this.opacityValBadge) this.opacityValBadge.textContent = `${opacityPct}%`;

    // Disable delete if only 2 stops
    if (this.btnDeleteStop) {
      this.btnDeleteStop.disabled = this.stops.length <= 2;
      this.btnDeleteStop.style.opacity = this.stops.length <= 2 ? '0.4' : '1';
    }

    // Highlight active pin
    this.updatePinActiveStates();
  }

  updateActiveStop(updates, reSort = true) {
    const stop = this.stops[this.activeStopIndex];
    if (!stop) return;

    Object.assign(stop, updates);

    if (reSort && typeof updates.position === 'number') {
      this.sortStops();
      this.activeStopIndex = this.stops.indexOf(stop);
    }

    this.renderRamp();
    this.applyCurrentGradient();
  }

  renderRamp() {
    if (!this.rampTrack) return;

    // Build linear representation for the visual ramp bar
    const stopsCss = this.stops
      .map(s => `${this.colorWithOpacity(s.color, s.opacity)} ${s.position}%`)
      .join(', ');

    this.rampTrack.style.background = `linear-gradient(to right, ${stopsCss})`;

    if (this.stopsCountBadge) {
      this.stopsCountBadge.textContent = `${this.stops.length} Color Stops`;
    }

    this.renderPins();
  }

  renderPins() {
    if (!this.rampPins) return;
    this.rampPins.innerHTML = '';

    this.stops.forEach((stop, idx) => {
      const pin = document.createElement('div');
      pin.className = `gradient-stop-pin ${idx === this.activeStopIndex ? 'active' : ''}`;
      pin.style.left = `${stop.position}%`;
      pin.title = `Stop ${idx + 1}: ${stop.color} (${stop.position}%)`;

      const colorPip = document.createElement('div');
      colorPip.className = 'stop-pip';
      colorPip.style.backgroundColor = stop.color;
      pin.appendChild(colorPip);

      // Pin drag logic
      let isDraggingPin = false;
      pin.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.selectStop(idx);
        isDraggingPin = true;

        const rect = this.rampTrack.getBoundingClientRect();
        const onMouseMove = (ev) => {
          if (!isDraggingPin) return;
          const pos = Math.round(Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100)));
          this.updateActiveStop({ position: pos }, false);
          pin.style.left = `${pos}%`;
        };

        const onMouseUp = () => {
          isDraggingPin = false;
          this.sortStops();
          this.renderRamp();
          this.selectStop(this.stops.indexOf(stop));
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      this.rampPins.appendChild(pin);
    });
  }

  updatePinActiveStates() {
    if (!this.rampPins) return;
    const pins = this.rampPins.querySelectorAll('.gradient-stop-pin');
    pins.forEach((p, idx) => {
      p.classList.toggle('active', idx === this.activeStopIndex);
    });
  }

  renderPresets() {
    if (!this.presetsGrid) return;
    this.presetsGrid.innerHTML = '';

    this.presets.forEach(preset => {
      const item = document.createElement('div');
      item.className = 'gradient-preset-card';
      item.title = `Terapkan preset ${preset.name}`;

      const swatch = document.createElement('div');
      swatch.className = 'preset-swatch';
      const stopsCss = preset.stops.map(s => `${s.color} ${s.position}%`).join(', ');
      swatch.style.background = `linear-gradient(135deg, ${stopsCss})`;

      const info = document.createElement('div');
      info.className = 'preset-info';
      info.innerHTML = `
        <span class="preset-name">${preset.name}</span>
        <span class="preset-hexes">${preset.stops[0].color} → ${preset.stops[preset.stops.length - 1].color}</span>
      `;

      item.appendChild(swatch);
      item.appendChild(info);

      item.addEventListener('click', () => {
        this.applyPreset(preset);
      });

      this.presetsGrid.appendChild(item);
    });
  }

  applyPreset(preset) {
    this.fillType = preset.type || 'linear';
    this.angle = preset.angle || 135;
    this.stops = JSON.parse(JSON.stringify(preset.stops));
    this.activeStopIndex = 0;

    // Switch tab UI
    this.setFillType(this.fillType);
    this.setAngle(this.angle);
    this.selectStop(0);

    this.app.boundary?.toast?.show('success', `Preset gradien "${preset.name}" diterapkan!`);
  }

  colorWithOpacity(hex, opacity = 1) {
    if (opacity >= 1) return hex;
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  buildCssGradient() {
    const stopsCss = this.stops
      .map(s => `${this.colorWithOpacity(s.color, s.opacity)} ${s.position}%`)
      .join(', ');

    if (this.fillType === 'radial') {
      return `radial-gradient(${this.radialShape}, ${stopsCss})`;
    } else {
      return `linear-gradient(${this.angle}deg, ${stopsCss})`;
    }
  }

  setTargetMode(mode, showToast = true) {
    this.targetMode = mode;

    if (this.btnTargetBg) this.btnTargetBg.classList.toggle('active', mode === 'background');
    if (this.btnTargetText) this.btnTargetText.classList.toggle('active', mode === 'text');

    if (this.targetNoticeText) {
      this.targetNoticeText.style.display = mode === 'text' ? 'flex' : 'none';
    }

    if (this.fillSectionTitle) {
      this.fillSectionTitle.textContent = mode === 'text' ? 'Text Gradient Fill' : 'Fill & Gradien';
    }

    // Inform ColorTuner
    this.colorTuner.setTextGradientMode(mode === 'text');

    if (showToast) {
      if (mode === 'text') {
        this.app.boundary?.toast?.show('success', 'Mode Teks Aktif: Gradien dipotong rapi mengikuti bentuk huruf.');
      } else {
        this.app.boundary?.toast?.show('success', 'Mode Latar Kotak Aktif: Gradien mengisi seluruh bidang elemen.');
      }
    }
  }

  applyCurrentGradient() {
    if (this.fillType === 'solid') return;

    const cssVal = this.buildCssGradient();
    if (!this.colorTuner.currentElement) return;

    const selector = this.colorTuner.currentElement.selector;
    const rule = this.colorTuner.styleRules.get(selector) || {};
    rule.background = cssVal;
    rule.isTextGradient = (this.targetMode === 'text');
    if (
      this.colorTuner.currentElement.hasTextGradient ||
      this.colorTuner.currentElement.classes?.includes('gradient-text') ||
      this.colorTuner.currentElement.classes?.includes('sandbox-gradient-text')
    ) {
      rule.hadTextGradient = true;
    }
    rule.important = this.colorTuner.useImportant;
    this.colorTuner.styleRules.set(selector, rule);

    this.colorTuner.syncCurrentStyles();
  }

  loadElement(elementData) {
    if (!elementData) return;

    const selector = elementData.selector;
    const existingRule = this.colorTuner.styleRules.get(selector);

    // Smart Auto-Detection for Gradient Text vs Background
    const isGradientText = existingRule?.isTextGradient ?? (
      elementData.hasTextGradient ||
      elementData.classes?.includes('gradient-text') ||
      elementData.classes?.includes('sandbox-gradient-text') ||
      elementData.computed?.webkitBackgroundClip === 'text' ||
      elementData.computed?.backgroundClip === 'text' ||
      (elementData.isTextElement && (!elementData.classes || elementData.classes.length === 0))
    );

    this.setTargetMode(isGradientText ? 'text' : 'background', false);

    // Check if element has an existing custom background rule in ColorTuner
    if (existingRule && existingRule.background) {
      this.parseAndLoadGradient(existingRule.background);
    } else if (elementData.computed?.backgroundImage && elementData.computed.backgroundImage.includes('gradient')) {
      // Element has a stylesheet gradient (e.g. from .gradient-text)
      this.parseAndLoadGradient(elementData.computed.backgroundImage);
    } else {
      // Element is currently solid color
      this.setFillType('solid');
      // Pre-seed the gradient colors using current text or background color
      const currentSeed = isGradientText
        ? (this.colorTuner.rgbToHex(elementData.computed?.color) || '#2563EB')
        : (existingRule?.backgroundColor || this.colorTuner.rgbToHex(elementData.computed?.backgroundColor) || '#2563EB');
      this.stops[0].color = currentSeed;
      this.renderRamp();
      this.selectStop(0);
    }
  }

  parseAndLoadGradient(gradientStr) {
    if (!gradientStr) return;

    if (gradientStr.startsWith('radial-gradient')) {
      this.fillType = 'radial';
    } else {
      this.fillType = 'linear';
      const angleMatch = gradientStr.match(/(\d+)deg/);
      if (angleMatch) {
        this.angle = parseInt(angleMatch[1], 10);
      }
    }

    // Extract color stops if present
    const colorMatches = gradientStr.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,6})/g);
    if (colorMatches && colorMatches.length >= 2) {
      this.stops = colorMatches.map((c, idx) => ({
        color: c.startsWith('rgb') ? this.colorTuner.rgbToHex(c) : c,
        position: Math.round((idx / (colorMatches.length - 1)) * 100),
        opacity: 1
      }));
      this.activeStopIndex = 0;
    }

    // Switch UI to gradient
    this.setFillType(this.fillType);
    if (this.fillType === 'linear') {
      this.setAngle(this.angle);
    }
    this.renderRamp();
    this.selectStop(0);
  }

  copyGradientCss() {
    const css = this.buildCssGradient();
    let fullRule = '';
    if (this.targetMode === 'text') {
      fullRule = `background: ${css};\n-webkit-background-clip: text;\nbackground-clip: text;\n-webkit-text-fill-color: transparent;\ncolor: transparent;\ndisplay: inline-block;`;
    } else {
      fullRule = `background: ${css};`;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullRule).then(() => {
        this.app.boundary?.toast?.show('success', 'Kode CSS Gradien disalin ke clipboard!');
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = fullRule;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.app.boundary?.toast?.show('success', 'Kode CSS Gradien disalin ke clipboard!');
    }
  }
}
