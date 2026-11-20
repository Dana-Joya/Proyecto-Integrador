/**
 * ==============================================================================
 * VISTA: ToastView (POO)
 * Sistema accesible de notificaciones flotantes (WCAG 4.1.3 Live Region).
 * ==============================================================================
 */

class ToastView {
  constructor() {
    this.container = document.getElementById('toastContainer');
  }

  show(message, duration = 3500) {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '✓';
    const text = document.createElement('span');
    text.textContent = String(message);
    toast.append(icon, text);

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

window.ToastView = ToastView;

