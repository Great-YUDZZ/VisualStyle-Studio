/**
 * VisualStyle Studio — Boundary States & Toast Feedback Engine
 * Implements 4 Mandatory Boundary States:
 * 1. Loading Skeleton
 * 2. Empty State
 * 3. Error Boundary + Retry
 * 4. Success Toast / Feedback
 */

export class BoundaryManager {
  constructor() {
    this.skeletonEl = document.getElementById('skeleton-overlay');
    this.emptyStateEl = document.getElementById('empty-state-view');
    this.errorDialogEl = document.getElementById('error-boundary-dialog');
    this.errorTitleEl = document.getElementById('error-title');
    this.errorBodyEl = document.getElementById('error-body');
    this.errorRetryBtn = document.getElementById('error-retry-btn');
    this.toastContainer = document.getElementById('toast-container');

    this.setupListeners();
  }

  setupListeners() {
    const errorCloseBtn = document.getElementById('error-close-btn');
    if (errorCloseBtn) {
      errorCloseBtn.addEventListener('click', () => this.hideError());
    }
  }

  // 1. Loading Skeleton
  showSkeleton() {
    if (this.skeletonEl) this.skeletonEl.style.display = 'flex';
  }

  hideSkeleton() {
    if (this.skeletonEl) this.skeletonEl.style.display = 'none';
  }

  // 2. Empty State
  showEmptyState() {
    if (this.emptyStateEl) this.emptyStateEl.style.display = 'flex';
  }

  hideEmptyState() {
    if (this.emptyStateEl) this.emptyStateEl.style.display = 'none';
  }

  // 3. Error Boundary + Retry
  showError(title, message, onRetry = null) {
    if (!this.errorDialogEl) return;
    this.errorTitleEl.textContent = title || 'Terjadi Kesalahan';
    this.errorBodyEl.textContent = message || 'Gagal memproses aksi.';
    this.errorDialogEl.style.display = 'flex';

    if (this.errorRetryBtn) {
      if (onRetry && typeof onRetry === 'function') {
        this.errorRetryBtn.style.display = 'inline-flex';
        this.errorRetryBtn.onclick = () => {
          this.hideError();
          onRetry();
        };
      } else {
        this.errorRetryBtn.style.display = 'none';
      }
    }
  }

  hideError() {
    if (this.errorDialogEl) this.errorDialogEl.style.display = 'none';
  }

  // 4. Success / Info Toast Notification
  showToast(message, duration = 3000, type = 'success') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast-pill toast-${type}`;
    
    // Emerald check icon for success
    const iconSvg = type === 'success' 
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;

    toast.innerHTML = `
      ${iconSvg}
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }
}
