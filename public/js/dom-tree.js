/**
 * VisualStyle Studio — DOM Tree & Hierarchy Manager
 * Renders the interactive DOM tree, element stack diagnostics, and breadcrumbs trail.
 */

export class DomTreeManager {
  constructor(app) {
    this.app = app;
    this.treeContainer = document.getElementById('dom-tree-container');
    this.breadcrumbsBar = document.getElementById('breadcrumbs-bar');
    this.specificityVal = document.getElementById('metric-specificity');
    this.computedBoxVal = document.getElementById('metric-computed-box');
    this.displayFlowVal = document.getElementById('metric-display-flow');
    this.activeSelectorEl = document.getElementById('target-selector-text');
  }

  // Render recursive DOM tree
  renderDomTree(rootNode, currentSelectedSelector = '') {
    if (!this.treeContainer || !rootNode) return;
    this.treeContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();
    this.buildNodeHtml(rootNode, fragment, 0, currentSelectedSelector);
    this.treeContainer.appendChild(fragment);
  }

  buildNodeHtml(node, parentElement, depth, selectedSelector) {
    if (!node) return;

    const row = document.createElement('div');
    row.className = 'tree-node';
    if (node.selector === selectedSelector) {
      row.classList.add('active');
    }
    row.style.paddingLeft = `${0.75 + depth * 0.75}rem`;

    const tagSpan = document.createElement('span');
    tagSpan.className = 'tree-node-tag';
    tagSpan.textContent = `<${node.tag}`;

    row.appendChild(tagSpan);

    if (node.id) {
      const idSpan = document.createElement('span');
      idSpan.className = 'tree-node-id';
      idSpan.textContent = `#${node.id}`;
      row.appendChild(idSpan);
    }

    if (node.className) {
      const classSpan = document.createElement('span');
      classSpan.className = 'tree-node-class';
      classSpan.textContent = node.className;
      row.appendChild(classSpan);
    }

    const closeSpan = document.createElement('span');
    closeSpan.className = 'tree-node-tag';
    closeSpan.textContent = `>`;
    row.appendChild(closeSpan);

    row.addEventListener('click', (e) => {
      e.stopPropagation();
      this.app.selectBySelector(node.selector);
    });

    parentElement.appendChild(row);

    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        this.buildNodeHtml(child, parentElement, depth + 1, selectedSelector);
      });
    }
  }

  // Update Breadcrumbs
  updateBreadcrumbs(breadcrumbs = [], selectedSelector = '') {
    if (!this.breadcrumbsBar) return;
    this.breadcrumbsBar.innerHTML = '';

    breadcrumbs.forEach((item, index) => {
      const crumb = document.createElement('span');
      crumb.className = 'crumb-item';
      crumb.textContent = item.label;
      if (item.selector === selectedSelector || index === breadcrumbs.length - 1) {
        crumb.classList.add('active');
      }

      crumb.addEventListener('click', () => {
        this.app.selectBySelector(item.selector);
      });

      this.breadcrumbsBar.appendChild(crumb);

      if (index < breadcrumbs.length - 1) {
        const sep = document.createElement('span');
        sep.textContent = '>';
        sep.style.color = '#cbd5e1';
        this.breadcrumbsBar.appendChild(sep);
      }
    });
  }

  // Update Diagnostics Card
  updateDiagnostics(data) {
    if (!data) return;
    if (this.activeSelectorEl) this.activeSelectorEl.textContent = data.selector;
    if (this.specificityVal) this.specificityVal.textContent = data.specificity || '(0, 0, 0)';
    if (this.computedBoxVal && data.rect) {
      this.computedBoxVal.textContent = `${data.rect.width} × ${data.rect.height} px`;
    }
    if (this.displayFlowVal && data.computed) {
      this.displayFlowVal.textContent = data.computed.display || 'block';
    }
  }
}
