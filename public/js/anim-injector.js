/**
 * VisualStyle Studio — Animation Injector Engine
 * Synthesizes CSS @keyframes and injects dynamic animation classes with timing curves
 */

export class AnimationInjector {
  constructor(app) {
    this.app = app;
    this.currentElement = null;

    this.activePreset = 'bounceIn';
    this.duration = 0.65;
    this.timingFunction = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    this.iteration = '1';
    this.trigger = 'hover'; // 'hover' or 'load'

    // Active animation configurations per selector: selector -> config
    this.animationRules = new Map();

    this.presets = {
      fadeIn: {
        name: 'Fade In',
        keyframes: `@keyframes vs-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`
      },
      slideUp: {
        name: 'Slide Up',
        keyframes: `@keyframes vs-slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}`
      },
      bounceIn: {
        name: 'Bounce In',
        keyframes: `@keyframes vs-bounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.06); }
  70% { transform: scale(0.96); }
  100% { transform: scale(1); }
}`
      },
      pulse: {
        name: 'Pulse',
        keyframes: `@keyframes vs-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}`
      },
      zoomIn: {
        name: 'Zoom In',
        keyframes: `@keyframes vs-zoomIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}`
      },
      rotate: {
        name: 'Rotate',
        keyframes: `@keyframes vs-rotate {
  from { transform: rotate(-180deg); opacity: 0; }
  to { transform: rotate(0deg); opacity: 1; }
}`
      },
      shake: {
        name: 'Shake',
        keyframes: `@keyframes vs-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}`
      },
      shimmer: {
        name: 'Shimmer',
        keyframes: `@keyframes vs-shimmer {
  0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
  50% { box-shadow: 0 0 20px 4px rgba(37, 99, 235, 0.5); }
}`
      }
    };

    this.setupUI();
  }

  setupUI() {
    this.presetsGrid = document.getElementById('animation-presets-grid');
    this.durationSlider = document.getElementById('anim-duration-slider');
    this.durationValText = document.getElementById('anim-duration-val');
    this.timingSelect = document.getElementById('anim-timing-select');
    this.triggerHoverBtn = document.getElementById('anim-trigger-hover');
    this.triggerLoadBtn = document.getElementById('anim-trigger-load');
    this.iterationSelect = document.getElementById('anim-iteration-select');
    this.replayBtn = document.getElementById('btn-replay-anim');

    this.renderPresetButtons();
    this.bindControls();
  }

  renderPresetButtons() {
    if (!this.presetsGrid) return;
    this.presetsGrid.innerHTML = '';

    Object.entries(this.presets).forEach(([key, preset]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `preset-btn ${key === this.activePreset ? 'active' : ''}`;
      btn.dataset.preset = key;
      btn.innerHTML = `<span>${preset.name}</span>`;

      btn.addEventListener('click', () => {
        this.selectPreset(key);
      });

      this.presetsGrid.appendChild(btn);
    });
  }

  bindControls() {
    if (this.durationSlider) {
      this.durationSlider.addEventListener('input', (e) => {
        this.duration = parseFloat(e.target.value);
        if (this.durationValText) this.durationValText.textContent = `${this.duration.toFixed(2)}s`;
        this.syncCurrentAnimation();
      });
    }

    if (this.timingSelect) {
      this.timingSelect.addEventListener('change', (e) => {
        this.timingFunction = e.target.value;
        this.syncCurrentAnimation();
      });
    }

    if (this.iterationSelect) {
      this.iterationSelect.addEventListener('change', (e) => {
        this.iteration = e.target.value;
        this.syncCurrentAnimation();
      });
    }

    if (this.triggerHoverBtn && this.triggerLoadBtn) {
      this.triggerHoverBtn.addEventListener('click', () => {
        this.trigger = 'hover';
        this.triggerHoverBtn.classList.add('active');
        this.triggerLoadBtn.classList.remove('active');
        this.syncCurrentAnimation();
      });

      this.triggerLoadBtn.addEventListener('click', () => {
        this.trigger = 'load';
        this.triggerLoadBtn.classList.add('active');
        this.triggerHoverBtn.classList.remove('active');
        this.syncCurrentAnimation();
      });
    }

    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => {
        this.replayAnimation();
      });
    }
  }

  selectPreset(key) {
    this.activePreset = key;
    if (this.presetsGrid) {
      this.presetsGrid.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === key);
      });
    }
    this.syncCurrentAnimation();
    this.replayAnimation();
  }

  loadElement(elementData) {
    this.currentElement = elementData;
    if (!elementData) return;

    const existing = this.animationRules.get(elementData.selector);
    if (existing) {
      this.activePreset = existing.preset;
      this.duration = existing.duration;
      this.timingFunction = existing.timingFunction;
      this.iteration = existing.iteration;
      this.trigger = existing.trigger;

      if (this.durationSlider) this.durationSlider.value = this.duration;
      if (this.durationValText) this.durationValText.textContent = `${this.duration.toFixed(2)}s`;
      if (this.timingSelect) this.timingSelect.value = this.timingFunction;
      if (this.iterationSelect) this.iterationSelect.value = this.iteration;

      if (this.triggerHoverBtn && this.triggerLoadBtn) {
        this.triggerHoverBtn.classList.toggle('active', this.trigger === 'hover');
        this.triggerLoadBtn.classList.toggle('active', this.trigger === 'load');
      }

      this.selectPreset(this.activePreset);
    }
  }

  syncCurrentAnimation() {
    if (!this.currentElement) return;

    const selector = this.currentElement.selector;
    const config = {
      preset: this.activePreset,
      duration: this.duration,
      timingFunction: this.timingFunction,
      iteration: this.iteration,
      trigger: this.trigger
    };

    this.animationRules.set(selector, config);

    const compiledCss = this.compileAllAnimations();
    this.app.sendToBridge('APPLY_ANIMATION', { css: compiledCss });
    this.app.updateGeneratedCssView();
  }

  compileAllAnimations() {
    let keyframesCollected = new Set();
    let rulesCss = '';

    this.animationRules.forEach((cfg, selector) => {
      const presetObj = this.presets[cfg.preset];
      if (!presetObj) return;

      keyframesCollected.add(presetObj.keyframes);

      const animDeclaration = `vs-${cfg.preset} ${cfg.duration}s ${cfg.timingFunction} ${cfg.iteration} both`;

      if (cfg.trigger === 'hover') {
        rulesCss += `
${selector}:hover {
  animation: ${animDeclaration};
}
`;
      } else {
        rulesCss += `
${selector} {
  animation: ${animDeclaration};
}
`;
      }
    });

    return Array.from(keyframesCollected).join('\n\n') + '\n\n' + rulesCss;
  }

  replayAnimation() {
    if (!this.currentElement) return;
    const selector = this.currentElement.selector;
    const config = this.animationRules.get(selector);
    if (!config) return;

    // Temporary force replay via Bridge
    const animDeclaration = `vs-${config.preset} ${config.duration}s ${config.timingFunction} ${config.iteration} both`;
    const tempReplayCss = `
${selector} {
  animation: none !important;
}
`;
    this.app.sendToBridge('APPLY_ANIMATION', { css: this.compileAllAnimations() + '\n' + tempReplayCss });

    setTimeout(() => {
      this.app.sendToBridge('APPLY_ANIMATION', { css: this.compileAllAnimations() });
    }, 40);
  }

  getAllGeneratedCss() {
    return this.compileAllAnimations();
  }
}
