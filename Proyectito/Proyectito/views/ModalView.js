/**
 * ==============================================================================
 * VISTA: ModalView (POO)
 * Gestiona ventanas modales accesibles con focus trap y restauración de foco.
 * ==============================================================================
 */

class ModalView {
  constructor() {
    this.overlay = document.getElementById('modalOverlay');
    this.titleEl = document.getElementById('modalTitle');
    this.bodyEl = document.getElementById('modalBody');
    this.footerEl = document.getElementById('modalFooter');
    this.closeBtn = document.getElementById('modalCloseBtn');

    if (this.overlay) {
      this.overlay.classList.remove('open', 'active');
      this.overlay.setAttribute('aria-hidden', 'true');
    }

    this.previouslyFocusedElement = null;
    this.bindEvents();
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  isOpen() {
    return this.overlay && (this.overlay.classList.contains('open') || this.overlay.classList.contains('active'));
  }

  open(title, bodyHtml, footerHtml) {
    if (!this.overlay) return;

    this.previouslyFocusedElement = document.activeElement;

    if (this.titleEl) this.titleEl.textContent = title;
    if (this.bodyEl) this.bodyEl.innerHTML = bodyHtml;
    if (this.footerEl) this.footerEl.innerHTML = footerHtml;

    this.overlay.classList.add('open');
    this.overlay.classList.add('active');
    this.overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Foco accesible al primer interactivo dentro del modal
    setTimeout(() => {
      const focusable = this.overlay.querySelectorAll('input, button, select, textarea, a[href]');
      if (focusable.length > 0) {
        focusable[0].focus();
      } else if (this.closeBtn) {
        this.closeBtn.focus();
      }
    }, 60);
  }

  close() {
    if (!this.overlay) return;

    this.overlay.classList.remove('open');
    this.overlay.classList.remove('active');
    this.overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
      this.previouslyFocusedElement.focus();
    }
  }
}

window.ModalView = ModalView;

