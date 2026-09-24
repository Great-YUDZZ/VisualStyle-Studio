/**
 * VisualStyle Studio — Color Tuner Engine
 * Handles real-time color picking, HEX/RGBA/HSLA conversions, specificity overrides,
 * and live CSS injection.
 */

import { GradientTuner } from './gradient-tuner.js';

export class ColorTuner {
  constructor(app) {
    this.app = app;
    this.currentElement = null;
    this.useImportant = true;

    // Track active styling rule overrides per selector
    this.styleRules = new Map(); // selector -> { bg, color, border, fill, stroke, important }

    this.swatchesContainer = document.getElementById('palette-swatches');
    this.importantToggle = document.getElementById('important-override-toggle');

    this.bgPicker = document.getElementById('color-picker-bg');
    this.bgText = document.getElementById('color-text-bg');
    this.colorPicker = document.getElementById('color-picker-text');
    this.colorText = document.getElementById('color-text-text');
    this.borderPicker = document.getElementById('color-picker-border');
    this.borderText = document.getElementById('color-text-border');
    this.fillPicker = document.getElementById('color-picker-fill');
    this.fillText = document.getElementById('color-text-fill');

    // Initialize Subsystem: Gradient Tuner
    this.gradientTuner = new GradientTuner(this.app, this);

    this.setupSwatches();
    this.setupListeners();
  }

  setupSwatches() {
    const defaultSwatches = [
      '#10B981', '#2563EB', '#0284C7', '#6366F1', '#8B5CF6',
      '#EC4899', '#F59E0B', '#EF4444', '#0F172A', '#FFFFFF'
    ];

    if (!this.swatchesContainer) return;
    this.swatchesContainer.innerHTML = '';

    defaultSwatches.forEach(color => {
      const chip = document.createElement('div');
      chip.className = 'swatch-chip';
      chip.style.backgroundColor = color;
      chip.title = `Terapkan ${color}`;
      chip.addEventListener('click', () => {
        // Apply to current background by default
        this.updateProperty('backgroundColor', color);
      });
      this.swatchesContainer.appendChild(chip);
    });
  }

  setupListeners() {
    // Background
    this.bindColorInputs(this.bgPicker, this.bgText, 'backgroundColor');
    // Text Color
    this.bindColorInputs(this.colorPicker, this.colorText, 'color');
    // Border Color
    this.bindColorInputs(this.borderPicker, this.borderText, 'borderColor');
    // SVG Fill / Stroke
    this.bindColorInputs(this.fillPicker, this.fillText, 'fill');

    // Specificity Override Toggle
    if (this.importantToggle) {
      this.importantToggle.addEventListener('change', (e) => {
        this.useImportant = e.target.checked;
        if (this.currentElement) {
          this.syncCurrentStyles();
        }
      });
    }
  }

  bindColorInputs(pickerEl, textEl, propName) {
    if (!pickerEl || !textEl) return;

    pickerEl.addEventListener('input', (e) => {
      const val = e.target.value;
      textEl.value = val;
      this.updateProperty(propName, val);
    });

    textEl.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#') && /^[0-9a-fA-F]{3,6}$/.test(val)) {
        val = '#' + val;
      }
      if (/^#[0-9a-fA-F]{3,8}$/.test(val)) {
        pickerEl.value = val.slice(0, 7);
      }
      this.updateProperty(propName, val);
    });
  }

  // Populate color values from newly selected element
  loadElement(elementData) {
    this.currentElement = elementData;
    if (!elementData) return;

    const selector = elementData.selector;
    const existingRule = this.styleRules.get(selector) || {};

    const computed = elementData.computed || {};
    const bgVal = existingRule.backgroundColor || this.rgbToHex(computed.backgroundColor) || '#ffffff';
    const textVal = existingRule.color || this.rgbToHex(computed.color) || '#0f172a';
    const borderVal = existingRule.borderColor || this.rgbToHex(computed.borderColor) || '#e2e8f0';
    const fillVal = existingRule.fill || this.rgbToHex(computed.fill) || '#2563eb';

    if (this.bgPicker) this.bgPicker.value = bgVal.slice(0, 7);
    if (this.bgText) this.bgText.value = bgVal;

    if (this.colorPicker) this.colorPicker.value = textVal.slice(0, 7);
    if (this.colorText) this.colorText.value = textVal;

    if (this.borderPicker) this.borderPicker.value = borderVal.slice(0, 7);
    if (this.borderText) this.borderText.value = borderVal;

    if (this.fillPicker) this.fillPicker.value = fillVal.slice(0, 7);
    if (this.fillText) this.fillText.value = fillVal;

    // Load into Gradient Tuner
    if (this.gradientTuner) {
      this.gradientTuner.loadElement(elementData);
    }
  }

  updateProperty(propName, value) {
    if (!this.currentElement) return;

    const selector = this.currentElement.selector;
    const rule = this.styleRules.get(selector) || {};
    rule[propName] = value;
    rule.important = this.useImportant;
    this.styleRules.set(selector, rule);

    this.syncCurrentStyles();
  }

  setTextGradientMode(isTextGradient) {
    if (!this.currentElement) return;
    const selector = this.currentElement.selector;
    const rule = this.styleRules.get(selector) || {};
    rule.isTextGradient = isTextGradient;
    if (this.currentElement.hasTextGradient || this.currentElement.classes?.includes('gradient-text')) {
      rule.hadTextGradient = true;
    }
    rule.important = this.useImportant;
    this.styleRules.set(selector, rule);
    this.syncCurrentStyles();
  }

  // Compile all active style rules into a single CSS string and dispatch
  syncCurrentStyles() {
    let cssText = '';

    this.styleRules.forEach((rule, selector) => {
      const imp = rule.important ? ' !important' : '';
      let declarations = [];

      if (rule.background) {
        declarations.push(`  background: ${rule.background}${imp};`);
        if (rule.isTextGradient) {
          declarations.push(`  -webkit-background-clip: text${imp};`);
          declarations.push(`  background-clip: text${imp};`);
          declarations.push(`  -webkit-text-fill-color: transparent${imp};`);
          declarations.push(`  color: transparent${imp};`);
          declarations.push(`  display: inline-block;`);
        } else if (rule.hadTextGradient) {
          declarations.push(`  -webkit-background-clip: border-box${imp};`);
          declarations.push(`  background-clip: border-box${imp};`);
          declarations.push(`  -webkit-text-fill-color: initial${imp};`);
        }
      } else if (rule.backgroundColor) {
        declarations.push(`  background-color: ${rule.backgroundColor}${imp};`);
        if (rule.hadTextGradient || rule.isTextGradient === false) {
          declarations.push(`  -webkit-background-clip: border-box${imp};`);
          declarations.push(`  background-clip: border-box${imp};`);
          declarations.push(`  -webkit-text-fill-color: initial${imp};`);
        }
      }

      if (rule.color && !rule.isTextGradient) declarations.push(`  color: ${rule.color}${imp};`);
      if (rule.borderColor) declarations.push(`  border-color: ${rule.borderColor}${imp};`);
      if (rule.fill) {
        declarations.push(`  fill: ${rule.fill}${imp};`);
        declarations.push(`  stroke: ${rule.fill}${imp};`);
      }

      if (declarations.length > 0) {
        cssText += `${selector} {\n${declarations.join('\n')}\n}\n\n`;
      }
    });

    this.app.sendToBridge('APPLY_STYLES', { css: cssText });
    this.app.updateGeneratedCssView();
  }

  getAllGeneratedCss() {
    let css = '';
    this.styleRules.forEach((rule, selector) => {
      const imp = rule.important ? ' !important' : '';
      let declarations = [];

      if (rule.background) {
        declarations.push(`  background: ${rule.background}${imp};`);
        if (rule.isTextGradient) {
          declarations.push(`  -webkit-background-clip: text${imp};`);
          declarations.push(`  background-clip: text${imp};`);
          declarations.push(`  -webkit-text-fill-color: transparent${imp};`);
          declarations.push(`  color: transparent${imp};`);
          declarations.push(`  display: inline-block;`);
        } else if (rule.hadTextGradient) {
          declarations.push(`  -webkit-background-clip: border-box${imp};`);
          declarations.push(`  background-clip: border-box${imp};`);
          declarations.push(`  -webkit-text-fill-color: initial${imp};`);
        }
      } else if (rule.backgroundColor) {
        declarations.push(`  background-color: ${rule.backgroundColor}${imp};`);
        if (rule.hadTextGradient || rule.isTextGradient === false) {
          declarations.push(`  -webkit-background-clip: border-box${imp};`);
          declarations.push(`  background-clip: border-box${imp};`);
          declarations.push(`  -webkit-text-fill-color: initial${imp};`);
        }
      }

      if (rule.color && !rule.isTextGradient) declarations.push(`  color: ${rule.color}${imp};`);
      if (rule.borderColor) declarations.push(`  border-color: ${rule.borderColor}${imp};`);
      if (rule.fill) declarations.push(`  fill: ${rule.fill}${imp};\n  stroke: ${rule.fill}${imp};`);

      if (declarations.length > 0) {
        css += `${selector} {\n${declarations.join('\n')}\n}\n`;
      }
    });
    return css;
  }

  rgbToHex(rgbStr) {
    if (!rgbStr || rgbStr === 'transparent' || rgbStr === 'rgba(0, 0, 0, 0)') return '#ffffff';
    if (rgbStr.startsWith('#')) return rgbStr;
    const match = rgbStr.match(/\d+/g);
    if (!match || match.length < 3) return '#ffffff';
    const r = parseInt(match[0], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[2], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
}
