/**
 * ==============================================================================
 * CONTROLADOR: AccessibilityController (POO)
 * Coordina las preferencias de accesibilidad, gestiona eventos y aplica
 * dinámicamente las adaptaciones visuales en el DOM.
 * ==============================================================================
 */

class AccessibilityController {
  constructor(model, view) {
    this.model = model || new AccessibilityModel();
    this.view = view || new AccessibilityView();

    this.init();
  }

  init() {
    this.bindEvents();
    // Suscribirse a cambios del modelo para aplicar al DOM
    this.model.subscribe((state) => {
      this.applyToDOM(state);
      this.view.updateControls(state);
    });
  }

  bindEvents() {
    // 1. Abrir / Cerrar Drawer desde el FAB
    if (this.view.fabBtn) {
      this.view.fabBtn.addEventListener('click', () => this.view.toggle());
    }

    // 2. Botón en Header (si existe)
    const headerBtn = document.getElementById('headerAccessibilityBtn');
    if (headerBtn) {
      headerBtn.addEventListener('click', () => this.view.toggle());
    }

    // 3. Botón cerrar y overlay
    const closeBtn = document.getElementById('accessibilityCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.view.close());
    }

    if (this.view.overlay) {
      this.view.overlay.addEventListener('click', () => this.view.close());
    }

    // 4. Atajo de teclado accesible: Alt + A
    document.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        this.view.toggle();
      } else if (e.key === 'Escape' && this.view.isOpen()) {
        this.view.close();
      }
    });

    // 5. Botones de Zoom
    document.addEventListener('click', (e) => {
      const zoomBtn = e.target.closest('.zoom-btn');
      if (zoomBtn && zoomBtn.dataset.scale) {
        const scale = parseFloat(zoomBtn.dataset.scale);
        this.model.set('fontScale', scale);
      }
    });

    // 6. Botones de Contraste
    document.addEventListener('click', (e) => {
      const contrastBtn = e.target.closest('[data-contrast]');
      if (contrastBtn) {
        this.model.set('contrastMode', contrastBtn.dataset.contrast);
      }
    });

    // 7. Botones de Daltonismo (Colorblind)
    document.addEventListener('click', (e) => {
      const cbBtn = e.target.closest('[data-colorblind]');
      if (cbBtn) {
        this.model.set('colorblindMode', cbBtn.dataset.colorblind);
      }
    });

    // 8. Interruptores Toggles
    const toggleBindings = [
      { id: 'toggleDyslexic',      prop: 'dyslexicFont' },
      { id: 'toggleSpacing',       prop: 'textSpacing' },
      { id: 'toggleHighlightLinks',prop: 'highlightLinks' },
      { id: 'toggleLargeCursor',   prop: 'largeCursor' },
      { id: 'toggleReduceMotion',  prop: 'reduceMotion' },
      { id: 'toggleReadingGuide',  prop: 'readingGuide' },
      { id: 'toggleCognitive',     prop: 'cognitiveMode' },
      { id: 'toggleFocus',         prop: 'focusMode' },
      { id: 'toggleLargeButtons',  prop: 'largeButtons' },
      { id: 'toggleHearing',       prop: 'hearingImpairment' },
      { id: 'toggleVoiceHelper',   prop: 'voiceReaderHelper' }
    ];

    toggleBindings.forEach(({ id, prop }) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', (e) => {
          this.model.set(prop, e.target.checked);
        });
      }
    });

    // 9. Lector de voz real mediante SpeechSynthesis del navegador
    const readPageBtn = document.getElementById('readPageBtn');
    const readSelectionBtn = document.getElementById('readSelectionBtn');
    const stopReadingBtn = document.getElementById('stopReadingBtn');
    const readerStatus = document.getElementById('readerStatus');

    this.speakText = (text) => {
      if (!('speechSynthesis' in window)) {
        if (readerStatus) readerStatus.textContent = 'Tu navegador no ofrece lectura de voz. Prueba con Chrome o Edge actualizado.';
        return;
      }
      const cleanText = String(text || '').replace(/\\s+/g, ' ').trim();
      if (!cleanText) {
        if (readerStatus) readerStatus.textContent = 'No hay texto disponible para leer.';
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-CO';
      utterance.rate = 0.95;
      utterance.onstart = () => {
        if (readerStatus) readerStatus.textContent = 'Leyendo en voz alta…';
        if (stopReadingBtn) stopReadingBtn.disabled = false;
      };
      utterance.onend = () => {
        if (readerStatus) readerStatus.textContent = 'Lectura finalizada.';
        if (stopReadingBtn) stopReadingBtn.disabled = true;
      };
      utterance.onerror = () => {
        if (readerStatus) readerStatus.textContent = 'No fue posible reproducir la voz. Revisa el audio del equipo.';
        if (stopReadingBtn) stopReadingBtn.disabled = true;
      };
      window.speechSynthesis.speak(utterance);
    };

    if (readPageBtn) readPageBtn.addEventListener('click', () => {
      const main = document.getElementById('mainContent');
      const active = main && (main.querySelector('.content-section.active-section') || main);
      const text = active ? active.innerText : document.body.innerText;
      this.speakText(text);
    });
    if (readSelectionBtn) readSelectionBtn.addEventListener('click', () => {
      const selected = window.getSelection ? window.getSelection().toString() : '';
      this.speakText(selected);
    });
    if (stopReadingBtn) stopReadingBtn.addEventListener('click', () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (readerStatus) readerStatus.textContent = 'Lectura detenida.';
      stopReadingBtn.disabled = true;
    });

    // El apoyo auditivo se puede comprobar con un aviso visual de ejemplo.
    const hearingToggle = document.getElementById('toggleHearing');
    if (hearingToggle) hearingToggle.addEventListener('change', () => {
      if (hearingToggle.checked && window.toastView) {
        window.toastView.show('Modo de apoyo auditivo activado: los avisos se presentan visualmente en pantalla.');
      }
    });

    // 10. Botón Restablecer
    const resetBtn = document.getElementById('accessibilityResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.model.reset();
        if (window.toastView) {
          window.toastView.show('Preferencias de accesibilidad restablecidas');
        }
      });
    }

    // 10. Guía de Lectura Visual (seguimiento del ratón)
    window.addEventListener('mousemove', (e) => {
      if (this.model.state.readingGuide) {
        this.view.updateReadingGuidePosition(e.clientY);
      }
    });
  }

  /**
   * Aplica las clases CSS y variables personalizadas en la etiqueta <html>
   */
  applyToDOM(state) {
    const root = document.documentElement;

    // 1. Escala Tipográfica (Zoom)
    root.style.setProperty('--font-scale', state.fontScale);

    // 2. Modos de Contraste (incluye dark-mode)
    const contrastClasses = ['high-contrast-dark', 'high-contrast-light', 'monochrome', 'invert-colors', 'dark-mode'];
    contrastClasses.forEach(cls => root.classList.remove(cls));
    if (state.contrastMode && state.contrastMode !== 'normal') {
      root.classList.add(state.contrastMode);
    }

    // 3. Daltonismo — filtros SVG
    root.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
    if (state.colorblindMode && state.colorblindMode !== 'none') {
      root.classList.add(`colorblind-${state.colorblindMode}`);
    }

    // 4. Toggles de legibilidad
    root.classList.toggle('dyslexic-font',    !!state.dyslexicFont);
    root.classList.toggle('text-spacing',     !!state.textSpacing);
    root.classList.toggle('highlight-links',  !!state.highlightLinks);
    root.classList.toggle('large-cursor',     !!state.largeCursor);
    root.classList.toggle('reduce-motion',    !!state.reduceMotion);

    // 5. Nuevos modos
    root.classList.toggle('cognitive-mode',   !!state.cognitiveMode);
    root.classList.toggle('focus-mode',       !!state.focusMode);
    root.classList.toggle('large-buttons',    !!state.largeButtons);
    root.classList.toggle('hearing-impairment', !!state.hearingImpairment);
    root.classList.toggle('voice-reader-helper', !!state.voiceReaderHelper);

    // 6. Región ARIA para anunciar cambios a tecnologías de asistencia
    if (state.voiceReaderHelper) {
      let liveRegion = document.getElementById('a11y-live-region');
      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'a11y-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(liveRegion);
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.AccessibilityController = AccessibilityController;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityController;
}
