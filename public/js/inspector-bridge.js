/**
 * VisualStyle Studio — High-Precision Chromatic Inspector Bridge
 * Injected into the iframe preview to render pixel-perfect, color-shifting
 * selection highlights with zero-lag scroll tracking and smart tooltip positioning.
 */
(() => {
  let isInspectMode = true;
  let hoveredElement = null;
  let selectedElement = null;
  let currentTheme = 'rainbow'; // 'rainbow' | 'cyan' | 'magenta' | 'emerald' | 'amber'

  // 1. Calculate CSS Specificity (A, B, C)
  function getSpecificity(selector) {
    let a = 0, b = 0, c = 0;
    const clean = selector.replace(/:not\([^)]*\)/g, '');
    const ids = clean.match(/#[a-zA-Z0-9_-]+/g);
    if (ids) a += ids.length;
    const classes = clean.match(/\.[a-zA-Z0-9_-]+/g);
    const attrs = clean.match(/\[[^\]]+\]/g);
    const pseudos = clean.match(/:(hover|active|focus|before|after)/g);
    if (classes) b += classes.length;
    if (attrs) b += attrs.length;
    if (pseudos) b += pseudos.length;
    const tags = clean.match(/^[a-zA-Z0-9]+|(?<=[ >+~])[a-zA-Z0-9]+/g);
    if (tags) c += tags.length;
    return `(${a}, ${b}, ${c})`;
  }

  // 2. Generate robust, unique CSS selector
  function getUniqueSelector(el) {
    if (!el || el === document.body || el === document.documentElement) return 'body';
    if (el.id) return `#${el.id}`;

    let path = [];
    let current = el;
    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.documentElement) {
      let selector = current.nodeName.toLowerCase();
      if (current.id) {
        selector = `#${current.id}`;
        path.unshift(selector);
        break;
      } else if (current.className && typeof current.className === 'string') {
        const validClasses = current.className.trim().split(/\s+/).filter(c => c && !c.startsWith('__vs') && !c.startsWith('vs-'));
        if (validClasses.length > 0) {
          selector += '.' + validClasses.slice(0, 2).join('.');
        }
      }
      
      let sibling = current;
      let nth = 1;
      while ((sibling = sibling.previousElementSibling)) {
        if (sibling.nodeName.toLowerCase() === current.nodeName.toLowerCase()) nth++;
      }
      if (nth > 1) selector += `:nth-of-type(${nth})`;

      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  }

  // 3. Get Breadcrumb Chain
  function getBreadcrumbChain(el) {
    const chain = [];
    let curr = el;
    while (curr && curr.nodeType === Node.ELEMENT_NODE && curr !== document.documentElement) {
      let label = curr.nodeName.toLowerCase();
      if (curr.id) label += `#${curr.id}`;
      else if (curr.classList && curr.classList.length > 0) {
        const firstClass = Array.from(curr.classList).find(c => !c.startsWith('__vs') && !c.startsWith('vs-'));
        if (firstClass) label += `.${firstClass}`;
      }
      chain.unshift({
        tag: curr.nodeName.toLowerCase(),
        selector: getUniqueSelector(curr),
        label
      });
      curr = curr.parentElement;
    }
    return chain;
  }

  // 4. Extract Element Payload for Studio UI
  function extractElementPayload(el) {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const computed = window.getComputedStyle(el);
    const selector = getUniqueSelector(el);

    return {
      selector,
      tag: el.nodeName.toLowerCase(),
      id: el.id || '',
      classes: Array.from(el.classList || []).filter(c => !c.startsWith('__vs') && !c.startsWith('vs-')),
      rect: {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      computed: {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        borderColor: computed.borderColor,
        fill: computed.fill,
        stroke: computed.stroke,
        display: computed.display,
        boxSizing: computed.boxSizing,
        backgroundClip: computed.backgroundClip || computed.webkitBackgroundClip || '',
        webkitBackgroundClip: computed.webkitBackgroundClip || '',
        webkitTextFillColor: computed.webkitTextFillColor || '',
        backgroundImage: computed.backgroundImage || ''
      },
      isTextElement: ['span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'strong', 'em', 'b', 'i', 'label', 'small', 'sub', 'sup'].includes(el.nodeName.toLowerCase()),
      hasTextGradient: (
        computed.webkitBackgroundClip === 'text' ||
        computed.backgroundClip === 'text' ||
        (el.classList && (el.classList.contains('gradient-text') || el.classList.contains('sandbox-gradient-text')))
      ),
      breadcrumbs: getBreadcrumbChain(el),
      specificity: getSpecificity(selector)
    };
  }

  // 5. Build recursive DOM Tree for Left Navigation
  function buildDomTree(node, depth = 0) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;
    if (node.nodeName.toLowerCase() === 'script' || node.nodeName.toLowerCase() === 'style') return null;
    if (node.id === '__vs_overlay_root') return null;

    const children = [];
    for (const child of node.children) {
      if (child.id === '__vs_overlay_root') continue;
      const childData = buildDomTree(child, depth + 1);
      if (childData) children.push(childData);
    }

    const firstClass = node.classList && node.classList.length > 0
      ? Array.from(node.classList).find(c => !c.startsWith('__vs') && !c.startsWith('vs-'))
      : '';

    return {
      tag: node.nodeName.toLowerCase(),
      id: node.id || '',
      className: firstClass ? `.${firstClass}` : '',
      selector: getUniqueSelector(node),
      children
    };
  }

  // 6. Send Event to Parent Studio
  function sendToParent(type, payload) {
    window.parent.postMessage({ source: 'VISUALSTYLE_BRIDGE', type, payload }, '*');
  }

  // 7. Inject High-Precision Inspector Overlay Elements directly into iframe body
  let overlayRoot, hoverBox, selectBox, tooltip, tooltipTag, tooltipClass, tooltipDim;

  function initOverlayDOM() {
    if (document.getElementById('__vs_overlay_root')) return;

    // Inject CSS styles for the chromatic selector
    const styleEl = document.createElement('style');
    styleEl.id = '__vs_overlay_styles';
    styleEl.textContent = `
      /* Chromatic Shifting Animation (Rainbow Flow) */
      @keyframes __vs_chromaticFlow {
        0% {
          border-color: #2563eb;
          box-shadow: 0 0 0 1px #ffffff, 0 0 14px rgba(37, 99, 235, 0.75), inset 0 0 6px rgba(37, 99, 235, 0.25);
        }
        20% {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 1px #ffffff, 0 0 14px rgba(139, 92, 246, 0.75), inset 0 0 6px rgba(139, 92, 246, 0.25);
        }
        40% {
          border-color: #ec4899;
          box-shadow: 0 0 0 1px #ffffff, 0 0 14px rgba(236, 72, 153, 0.75), inset 0 0 6px rgba(236, 72, 153, 0.25);
        }
        60% {
          border-color: #f59e0b;
          box-shadow: 0 0 0 1px #ffffff, 0 0 14px rgba(245, 158, 11, 0.75), inset 0 0 6px rgba(245, 158, 11, 0.25);
        }
        80% {
          border-color: #10b981;
          box-shadow: 0 0 0 1px #ffffff, 0 0 14px rgba(16, 185, 129, 0.75), inset 0 0 6px rgba(16, 185, 129, 0.25);
        }
        100% {
          border-color: #2563eb;
          box-shadow: 0 0 0 1px #ffffff, 0 0 14px rgba(37, 99, 235, 0.75), inset 0 0 6px rgba(37, 99, 235, 0.25);
        }
      }

      #__vs_overlay_root {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none !important;
        z-index: 2147483640;
        overflow: visible;
      }

      /* Hover Box */
      #__vs_hover_box {
        position: absolute;
        border: 1.5px dashed #0284c7;
        background: rgba(2, 132, 199, 0.08);
        border-radius: 3px;
        pointer-events: none !important;
        z-index: 2147483641;
        display: none;
        box-sizing: border-box;
      }

      /* Active Selected Element Box */
      #__vs_select_box {
        position: absolute;
        border-width: 2.5px;
        border-style: solid;
        border-radius: 3px;
        pointer-events: none !important;
        z-index: 2147483645;
        display: none;
        box-sizing: border-box;
        background: rgba(37, 99, 235, 0.06);
        transition: top 0.04s ease-out, left 0.04s ease-out, width 0.04s ease-out, height 0.04s ease-out;
      }

      /* Themes */
      #__vs_select_box.theme-rainbow {
        animation: __vs_chromaticFlow 3.5s linear infinite !important;
      }

      #__vs_select_box.theme-cyan {
        border-color: #00f0ff !important;
        box-shadow: 0 0 0 1px #ffffff, 0 0 16px rgba(0, 240, 255, 0.85), inset 0 0 6px rgba(0, 240, 255, 0.3) !important;
        background: rgba(0, 240, 255, 0.08) !important;
      }

      #__vs_select_box.theme-magenta {
        border-color: #ff2a85 !important;
        box-shadow: 0 0 0 1px #ffffff, 0 0 16px rgba(255, 42, 133, 0.85), inset 0 0 6px rgba(255, 42, 133, 0.3) !important;
        background: rgba(255, 42, 133, 0.08) !important;
      }

      #__vs_select_box.theme-emerald {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 1px #ffffff, 0 0 16px rgba(16, 185, 129, 0.85), inset 0 0 6px rgba(16, 185, 129, 0.3) !important;
        background: rgba(16, 185, 129, 0.08) !important;
      }

      #__vs_select_box.theme-amber {
        border-color: #f59e0b !important;
        box-shadow: 0 0 0 1px #ffffff, 0 0 16px rgba(245, 158, 11, 0.85), inset 0 0 6px rgba(245, 158, 11, 0.3) !important;
        background: rgba(245, 158, 11, 0.08) !important;
      }

      /* Corner Anchor Handles */
      .vs-handle {
        position: absolute;
        width: 7px;
        height: 7px;
        background: #ffffff;
        border: 1.5px solid #0f172a;
        border-radius: 1.5px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      }
      .vs-handle-tl { top: -4.5px; left: -4.5px; }
      .vs-handle-tr { top: -4.5px; right: -4.5px; }
      .vs-handle-bl { bottom: -4.5px; left: -4.5px; }
      .vs-handle-br { bottom: -4.5px; right: -4.5px; }

      /* Floating Tooltip Pill */
      #__vs_tooltip {
        position: absolute;
        top: -29px;
        left: -2px;
        background: #0f172a;
        color: #ffffff;
        font-family: 'JetBrains Mono', Menlo, Consolas, monospace;
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 4px;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        gap: 5px;
        pointer-events: none !important;
        z-index: 2147483647;
      }

      #__vs_tooltip.vs-flipped {
        top: auto;
        bottom: -29px;
      }

      .vs-tag { color: #60a5fa; font-weight: 700; }
      .vs-class { color: #34d399; }
      .vs-dim { color: #94a3b8; font-size: 10px; margin-left: 2px; }
    `;
    document.head.appendChild(styleEl);

    // Create Root Container
    overlayRoot = document.createElement('div');
    overlayRoot.id = '__vs_overlay_root';

    // Hover Box
    hoverBox = document.createElement('div');
    hoverBox.id = '__vs_hover_box';
    overlayRoot.appendChild(hoverBox);

    // Select Box with Handles and Tooltip
    selectBox = document.createElement('div');
    selectBox.id = '__vs_select_box';
    selectBox.className = `theme-${currentTheme}`;

    tooltip = document.createElement('div');
    tooltip.id = '__vs_tooltip';
    tooltipTag = document.createElement('span');
    tooltipTag.className = 'vs-tag';
    tooltipClass = document.createElement('span');
    tooltipClass.className = 'vs-class';
    tooltipDim = document.createElement('span');
    tooltipDim.className = 'vs-dim';

    tooltip.appendChild(tooltipTag);
    tooltip.appendChild(tooltipClass);
    tooltip.appendChild(tooltipDim);
    selectBox.appendChild(tooltip);

    // 4 Corner Handles
    ['tl', 'tr', 'bl', 'br'].forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `vs-handle vs-handle-${pos}`;
      selectBox.appendChild(handle);
    });

    overlayRoot.appendChild(selectBox);
    document.body.appendChild(overlayRoot);
  }

  // 8. Update Bounding Box Position (Guaranteed Pixel-Perfect with Scroll Offset)
  function updateElementBox(targetBox, el) {
    if (!el || !document.body.contains(el) || !isInspectMode) {
      targetBox.style.display = 'none';
      return;
    }

    const rect = el.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    targetBox.style.display = 'block';
    targetBox.style.top = `${rect.top + scrollY}px`;
    targetBox.style.left = `${rect.left + scrollX}px`;
    targetBox.style.width = `${rect.width}px`;
    targetBox.style.height = `${rect.height}px`;

    if (targetBox === selectBox) {
      const tag = el.nodeName.toLowerCase();
      const firstClass = el.classList && el.classList.length > 0 
        ? Array.from(el.classList).find(c => !c.startsWith('__vs') && !c.startsWith('vs-'))
        : '';
      const idStr = el.id ? `#${el.id}` : '';
      const classStr = firstClass ? `.${firstClass}` : '';
      
      tooltipTag.textContent = tag + idStr;
      tooltipClass.textContent = classStr;
      tooltipDim.textContent = `${Math.round(rect.width)}×${Math.round(rect.height)}px`;

      // Smart flip tooltip if element is at the very top of page
      if (rect.top < 32) {
        tooltip.classList.add('vs-flipped');
      } else {
        tooltip.classList.remove('vs-flipped');
      }
    }
  }

  function refreshSelection() {
    if (selectedElement && isInspectMode) {
      updateElementBox(selectBox, selectedElement);
    }
  }

  // Window Scroll & Resize Listeners for 60fps synchronous tracking
  window.addEventListener('scroll', refreshSelection, { passive: true });
  window.addEventListener('resize', refreshSelection, { passive: true });

  // Mouse Hover Tracker
  document.addEventListener('mouseover', (e) => {
    if (!isInspectMode) return;
    const target = e.target;
    if (!target || target === document.body || target === document.documentElement || target.closest('#__vs_overlay_root')) return;
    
    hoveredElement = target;
    if (target !== selectedElement) {
      updateElementBox(hoverBox, target);
    } else {
      hoverBox.style.display = 'none';
    }
    sendToParent('ELEMENT_HOVER', extractElementPayload(target));
  }, true);

  document.addEventListener('mouseout', (e) => {
    if (hoverBox) hoverBox.style.display = 'none';
  }, true);

  // Mouse Click Selector
  document.addEventListener('click', (e) => {
    if (!isInspectMode) return;
    const target = e.target;
    if (!target || target === document.documentElement || target.closest('#__vs_overlay_root')) return;

    e.preventDefault();
    e.stopPropagation();

    selectedElement = target;
    if (hoverBox) hoverBox.style.display = 'none';
    updateElementBox(selectBox, target);
    sendToParent('ELEMENT_SELECTED', extractElementPayload(target));
  }, true);

  // Update or Inject Dynamic Style Sheet
  function applyLiveStyles(cssText) {
    let styleTag = document.getElementById('__visualstyle_live_styles__');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = '__visualstyle_live_styles__';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = cssText;
  }

  // Update or Inject Animation Keyframes
  function applyLiveAnimation(cssText) {
    let animTag = document.getElementById('__visualstyle_live_keyframes__');
    if (!animTag) {
      animTag = document.createElement('style');
      animTag.id = '__visualstyle_live_keyframes__';
      document.head.appendChild(animTag);
    }
    animTag.textContent = cssText;
  }

  // Listen for Messages from Studio UI
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.target !== 'VISUALSTYLE_BRIDGE') return;

    switch (data.action) {
      case 'SET_INSPECT_MODE':
        isInspectMode = !!data.enabled;
        if (!isInspectMode) {
          if (selectBox) selectBox.style.display = 'none';
          if (hoverBox) hoverBox.style.display = 'none';
        } else {
          refreshSelection();
        }
        break;

      case 'SET_SELECTOR_THEME':
        if (data.theme) {
          currentTheme = data.theme;
          if (selectBox) {
            selectBox.className = `theme-${currentTheme}`;
          }
        }
        break;

      case 'SELECT_BY_SELECTOR':
        try {
          const el = document.querySelector(data.selector);
          if (el) {
            selectedElement = el;
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            setTimeout(() => {
              updateElementBox(selectBox, el);
              sendToParent('ELEMENT_SELECTED', extractElementPayload(el));
            }, 100);
          }
        } catch (e) {
          console.warn('Invalid selector:', data.selector);
        }
        break;

      case 'APPLY_STYLES':
        applyLiveStyles(data.css);
        // Refresh bounding rect of selected element after style update
        setTimeout(refreshSelection, 40);
        break;

      case 'APPLY_ANIMATION':
        applyLiveAnimation(data.css);
        break;

      case 'REPLAY_ANIMATION':
        if (selectedElement && data.className) {
          selectedElement.classList.remove(data.className);
          void selectedElement.offsetWidth; // Force DOM reflow
          selectedElement.classList.add(data.className);
        }
        break;
    }
  });

  // Signal Ready on Window Load
  function onReady() {
    initOverlayDOM();

    setTimeout(() => {
      const tree = buildDomTree(document.body);
      sendToParent('PREVIEW_READY', { domTree: tree });

      // Automatically select main CTA button if exists as default
      const defaultCta = document.querySelector('#main-cta-button, .btn-primary, button');
      if (defaultCta) {
        selectedElement = defaultCta;
        updateElementBox(selectBox, defaultCta);
        sendToParent('ELEMENT_SELECTED', extractElementPayload(defaultCta));
      }
    }, 150);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
