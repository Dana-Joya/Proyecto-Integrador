/**
 * ==============================================================================
 * VISTA: AccessibilityView (POO)
 * Renderiza el botón flotante (FAB), el panel lateral (Drawer) y los controles
 * interactivos de accesibilidad universal — incluye modos de daltonismo,
 * cognición, concentración, motor, auditivo y lector de voz.
 * ==============================================================================
 */

class AccessibilityView {
  constructor() {
    this.createElements();
  }

  createElements() {
    // 1. Barra de Guía de Lectura
    if (!document.getElementById('readingGuideBar')) {
      const guide = document.createElement('div');
      guide.id = 'readingGuideBar';
      document.body.appendChild(guide);
      this.readingGuideBar = guide;
    } else {
      this.readingGuideBar = document.getElementById('readingGuideBar');
    }

    // 2. Botón Flotante de Accesibilidad (FAB)
    if (!document.getElementById('accessibilityFabBtn')) {
      const fab = document.createElement('button');
      fab.id = 'accessibilityFabBtn';
      fab.className = 'accessibility-fab';
      fab.type = 'button';
      fab.setAttribute('aria-label', 'Abrir panel de herramientas de accesibilidad (Alt + A)');
      fab.setAttribute('title', 'Herramientas de Accesibilidad Universal (Alt + A)');
      fab.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="4" r="2"/>
          <path d="m18 19 1-7-6 1"/>
          <path d="m5 8 3-3 5.5 3-2.36 3.5"/>
          <path d="M4.24 14.5a5 5 0 0 0 6.88 6"/>
          <path d="M13.76 17.5a5 5 0 0 0-1.76-7.5"/>
        </svg>
      `;
      document.body.appendChild(fab);
      this.fabBtn = fab;
    } else {
      this.fabBtn = document.getElementById('accessibilityFabBtn');
    }

    // 3. Drawer y Overlay de Accesibilidad
    if (!document.getElementById('accessibilityDrawer')) {
      const overlay = document.createElement('div');
      overlay.id = 'accessibilityDrawerOverlay';
      overlay.className = 'accessibility-drawer-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      const drawer = document.createElement('aside');
      drawer.id = 'accessibilityDrawer';
      drawer.className = 'accessibility-drawer';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      drawer.setAttribute('aria-label', 'Panel de Ajustes de Accesibilidad Universal');
      drawer.innerHTML = `
        <div class="accessibility-drawer-header">
          <div class="accessibility-drawer-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="4" r="2"/>
              <path d="m18 19 1-7-6 1"/>
              <path d="m5 8 3-3 5.5 3-2.36 3.5"/>
              <path d="M4.24 14.5a5 5 0 0 0 6.88 6"/>
              <path d="M13.76 17.5a5 5 0 0 0-1.76-7.5"/>
            </svg>
            <span>Accesibilidad Universal</span>
          </div>
          <button id="accessibilityCloseBtn" class="accessibility-close-btn" type="button" aria-label="Cerrar panel de accesibilidad">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="accessibility-drawer-body">

          <!-- SECCIÓN 1: TAMAÑO DE LETRA / ZOOM -->
          <div>
            <div class="access-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><text x="4" y="18" font-size="14" font-weight="bold" stroke-width="1.5">A</text><text x="13" y="14" font-size="9" font-weight="bold" stroke-width="1.2">A</text></svg>
              <span>Tamaño de Letra (Zoom Tipográfico)</span>
            </div>
            <div class="zoom-controls-grid">
              <button type="button" class="zoom-btn" data-scale="1">100%</button>
              <button type="button" class="zoom-btn" data-scale="1.15">115%</button>
              <button type="button" class="zoom-btn" data-scale="1.3">130%</button>
              <button type="button" class="zoom-btn" data-scale="1.5">150%</button>
            </div>
            <div id="zoomIndicatorText" class="zoom-indicator-text">Escala actual: 100% (Normal)</div>
          </div>

          <!-- SECCIÓN 2: MODOS DE CONTRASTE Y COLOR -->
          <div>
            <div class="access-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" opacity="0.3"/></svg>
              <span>Contraste &amp; Esquema Visual</span>
            </div>
            <div class="contrast-options-grid">
              <button type="button" class="contrast-card-btn" data-contrast="normal">
                <span class="contrast-card-name">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                  <span>Normal</span>
                </span>
                <span class="contrast-card-desc">Colores por defecto</span>
              </button>
              <button type="button" class="contrast-card-btn" data-contrast="dark-mode">
                <span class="contrast-card-name">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  <span>Modo Oscuro</span>
                </span>
                <span class="contrast-card-desc">Fondo oscuro cómodo</span>
              </button>
              <button type="button" class="contrast-card-btn" data-contrast="high-contrast-dark">
                <span class="contrast-card-name">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18" fill="none"/><rect x="3" y="3" width="9" height="18" fill="currentColor"/></svg>
                  <span>Alto Contraste Oscuro</span>
                </span>
                <span class="contrast-card-desc">Negro + amarillo AAA</span>
              </button>
              <button type="button" class="contrast-card-btn" data-contrast="high-contrast-light">
                <span class="contrast-card-name">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                  <span>Alto Contraste Claro</span>
                </span>
                <span class="contrast-card-desc">Blanco + negro AAA</span>
              </button>
              <button type="button" class="contrast-card-btn" data-contrast="monochrome">
                <span class="contrast-card-name">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" opacity="0.6"/></svg>
                  <span>Escala de Grises</span>
                </span>
                <span class="contrast-card-desc">Sin color (monocromático)</span>
              </button>
              <button type="button" class="contrast-card-btn" data-contrast="invert-colors">
                <span class="contrast-card-name">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l10 10-10 10L2 12z"/><path d="M12 2v20" stroke-dasharray="3 3"/></svg>
                  <span>Invertir Colores</span>
                </span>
                <span class="contrast-card-desc">Inversión total de pantalla</span>
              </button>
            </div>
          </div>

          <!-- SECCIÓN 3: ADAPTACIONES DE LECTURA -->
          <div>
            <div class="access-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>Adaptaciones de Lectura</span>
            </div>
            <div class="access-toggles-list">

              <!-- Fuente Dislexia -->
              <div class="access-toggle-item">
                <div class="access-toggle-info">
                  <label for="toggleDyslexic" class="access-toggle-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
                    Fuente para Dislexia
                  </label>
                  <span class="access-toggle-desc">Tipografía optimizada para dislexia</span>
                </div>
                <label class="switch-accessible">
                  <input type="checkbox" id="toggleDyslexic">
                  <span class="switch-slider"></span>
                </label>
              </div>

              <!-- Espaciado de Texto -->
              <div class="access-toggle-item">
                <div class="access-toggle-info">
                  <label for="toggleSpacing" class="access-toggle-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10H3M21 6H3M21 14H3M21 18H3"/></svg>
                    Espacio de Texto
                  </label>
                  <span class="access-toggle-desc">Aumenta interlineado y espaciado</span>
                </div>
                <label class="switch-accessible">
                  <input type="checkbox" id="toggleSpacing">
                  <span class="switch-slider"></span>
                </label>
              </div>

              <!-- Resaltar enlaces -->
              <div class="access-toggle-item">
                <div class="access-toggle-info">
                  <label for="toggleHighlightLinks" class="access-toggle-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    Resaltar Vínculos
                  </label>
                  <span class="access-toggle-desc">Subraya todos los enlaces y botones</span>
                </div>
                <label class="switch-accessible">
                  <input type="checkbox" id="toggleHighlightLinks">
                  <span class="switch-slider"></span>
                </label>
              </div>

              <!-- Guía de Lectura -->
              <div class="access-toggle-item">
                <div class="access-toggle-info">
                  <label for="toggleReadingGuide" class="access-toggle-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12"/><path d="M5 8l-3 4 3 4M19 8l3 4-3 4"/></svg>
                    Guía de Lectura Visual
                  </label>
                  <span class="access-toggle-desc">Línea que sigue el cursor del ratón</span>
                </div>
                <label class="switch-accessible">
                  <input type="checkbox" id="toggleReadingGuide">
                  <span class="switch-slider"></span>
                </label>
              </div>

            </div>
          </div>

          <!-- SECCIÓN 4: VISIÓN — DALTONISMO -->
          <div>
            <div class="access-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Simulación Visual (Daltonismo)</span>
            </div>
            <div class="colorblind-options-grid">
              <button type="button" class="contrast-card-btn" data-colorblind="none">
                <span class="contrast-card-name">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                  <span>Normal</span>
                </span>
              </button>
              <button type="button" class="contrast-card-btn" data-colorblind="protanopia">
                <span class="contrast-card-name">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20" stroke-dasharray="2 2"/></svg>
                  <span>Protanopia</span>
                </span>
                <span class="contrast-card-desc">Sin sensibilidad al rojo</span>
              </button>
              <button type="button" class="contrast-card-btn" data-colorblind="deuteranopia">
                <span class="contrast-card-name">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8" stroke-dasharray="2 2"/></svg>
                  <span>Deuteranopia</span>
                </span>
                <span class="contrast-card-desc">Sin sensibilidad al verde</span>
              </button>
              <button type="button" class="contrast-card-btn" data-colorblind="tritanopia">
                <span class="contrast-card-name">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M6 18L18 6" stroke-dasharray="2 2"/></svg>
                  <span>Tritanopia</span>
                </span>
                <span class="contrast-card-desc">Sin sensibilidad al azul</span>
              </button>
            </div>
          </div>

          <!-- SECCIÓN 5: COGNICIÓN & CONCENTRACIÓN -->
          <div>
            <div class="access-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
              <span>Cognición &amp; Concentración</span>
            </div>
            <div class="access-toggles-list">

              <!-- Modo Cognitivo -->
              <div class="access-toggle-item">
                <div class="access-toggle-info">
                  <label for="toggleCognitive" class="access-toggle-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
                    Modo Cognitivo
                  </label>
                  <span class="access-toggle-desc">Simplifica la interfaz, oculta textos largos</span>
                </div>
                <label class="switch-accessible">
                  <input type="checkbox" id="toggleCognitive">
                  <span class="switch-slider"></span>
                </label>
              </div>

              <!-- Modo Enfoque de Concentración -->
              <div class="access-toggle-item">
                <div class="access-toggle-info">
                  <label for="toggleFocus" class="access-toggle-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
                    Enfoque de Concentración
                  </label>
                  <span class="access-toggle-desc">Atenúa elementos no activos del menú</span>
                </div>
                <label class="switch-accessible">
                  <input type="checkbox" id="toggleFocus">
                  <span class="switch-slider"></span>
                </label>
              </div>

            </div>
          </div>

          <!-- SECCIÓN 6: MOTOR & INTERACCIÓN -->
          <div>
            <div class="access-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
              <span>Motor &amp; Interacción</span>
            </div>
            <div class="access-toggles-list">

              <!-- Cursor Grande -->
              <div class="access-toggle-item">
                <div class="access-toggle-info">
                  <label for="toggleLargeCursor" class="access-toggle-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l7.07 17 2.51-7.39 7.39-2.51L4 4z"/></svg>
                    Cursor Grande
                  </label>
                  <span class="access-toggle-desc">Amplía el puntero del ratón</span>
                </div>
                <label class="switch-accessible">
                  <input type="checkbox" id="toggleLargeCursor">
                  <span class="switch-slider"></span>
                </label>
              </div>

              <!-- Botones Grandes -->
              <div class="access-toggle-item">
                <div class="access-toggle-info">
                  <label for="toggleLargeButtons" class="access-toggle-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="3"/><path d="M8 12h8"/></svg>
                    Botones Grandes
                  </label>
                  <span class="access-toggle-desc">Aumenta el área de toque de los botones</span>
                </div>
                <label class="switch-accessible">
                  <input type="checkbox" id="toggleLargeButtons">
                  <span class="switch-slider"></span>
                </label>
              </div>

              <!-- Detener Animaciones -->
              <div class="access-toggle-item">
                <div class="access-toggle-info">
                  <label for="toggleReduceMotion" class="access-toggle-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>
                    Detener Animaciones
                  </label>
                  <span class="access-toggle-desc">Desactiva transiciones y parpadeos</span>
                </div>
                <label class="switch-accessible">
                  <input type="checkbox" id="toggleReduceMotion">
                  <span class="switch-slider"></span>
                </label>
              </div>

            </div>
          </div>

          <!-- SECCIÓN 7: AUDITIVO & LECTOR -->
          <div>
            <div class="access-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5"/><path d="M17 3a2.828 2.828 0 1 1 4 4L12 15l-4 1 1-4L17 3z"/></svg>
              <span>Auditivo &amp; Lector</span>
            </div>
            <div class="access-toggles-list">

              <!-- Apoyo para personas con discapacidad auditiva -->
              <div class="access-toggle-item">
                <div class="access-toggle-info">
                  <label for="toggleHearing" class="access-toggle-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    Apoyo para personas con discapacidad auditiva
                  </label>
                  <span class="access-toggle-desc">Refuerza visualmente los avisos y notificaciones del sistema</span>
                </div>
                <label class="switch-accessible">
                  <input type="checkbox" id="toggleHearing">
                  <span class="switch-slider"></span>
                </label>
              </div>

              <div class="accessibility-reader-tools" aria-label="Herramientas del lector de voz">
                <p class="access-toggle-desc">Lee en voz alta el contenido principal de la página usando la voz disponible en tu navegador.</p>
                <div class="accessibility-reader-actions">
                  <button type="button" id="readPageBtn" class="btn-reader-action">▶ Leer contenido</button>
                  <button type="button" id="stopReadingBtn" class="btn-reader-action" disabled>■ Detener</button>
                </div>
                <p id="readerStatus" class="reader-status" role="status" aria-live="polite">Lector listo. Puedes seleccionar un texto y usar Leer selección.</p>
                <button type="button" id="readSelectionBtn" class="btn-reader-link">Leer texto seleccionado</button>
              </div>

              <!-- Lector de Voz -->
              <div class="access-toggle-item">
                <div class="access-toggle-info">
                  <label for="toggleVoiceHelper" class="access-toggle-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    Lector de Voz (ARIA)
                  </label>
                  <span class="access-toggle-desc">Activa anuncios de región ARIA en vivo</span>
                </div>
                <label class="switch-accessible">
                  <input type="checkbox" id="toggleVoiceHelper">
                  <span class="switch-slider"></span>
                </label>
              </div>

            </div>
          </div>

        </div>

        <div class="accessibility-drawer-footer">
          <button id="accessibilityResetBtn" class="btn-reset-accessibility" type="button" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Restablecer Valores por Defecto
          </button>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.appendChild(drawer);

      this.overlay = overlay;
      this.drawer = drawer;
    } else {
      this.overlay = document.getElementById('accessibilityDrawerOverlay');
      this.drawer = document.getElementById('accessibilityDrawer');
    }
  }

  isOpen() {
    return this.drawer && this.drawer.classList.contains('active');
  }

  open() {
    if (!this.drawer) return;
    this.overlay.classList.add('active');
    this.drawer.classList.add('active');
    this.drawer.setAttribute('aria-hidden', 'false');
    const closeBtn = document.getElementById('accessibilityCloseBtn');
    if (closeBtn) closeBtn.focus();
  }

  close() {
    if (!this.drawer) return;
    this.overlay.classList.remove('active');
    this.drawer.classList.remove('active');
    this.drawer.setAttribute('aria-hidden', 'true');
    if (this.fabBtn) this.fabBtn.focus();
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  updateControls(state) {
    // 1. Zoom Buttons
    document.querySelectorAll('.zoom-btn').forEach(btn => {
      const scale = parseFloat(btn.dataset.scale);
      btn.classList.toggle('active', Math.abs(scale - state.fontScale) < 0.01);
    });

    const indicator = document.getElementById('zoomIndicatorText');
    if (indicator) {
      indicator.textContent = `Escala actual: ${Math.round(state.fontScale * 100)}%`;
    }

    // 2. Contrast Buttons
    document.querySelectorAll('[data-contrast]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.contrast === state.contrastMode);
    });

    // 3. Colorblind Buttons
    document.querySelectorAll('[data-colorblind]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.colorblind === state.colorblindMode);
    });

    // 4. Toggles
    const toggleMap = {
      toggleDyslexic: state.dyslexicFont,
      toggleSpacing: state.textSpacing,
      toggleHighlightLinks: state.highlightLinks,
      toggleLargeCursor: state.largeCursor,
      toggleReduceMotion: state.reduceMotion,
      toggleReadingGuide: state.readingGuide,
      toggleCognitive: state.cognitiveMode,
      toggleFocus: state.focusMode,
      toggleLargeButtons: state.largeButtons,
      toggleHearing: state.hearingImpairment,
      toggleVoiceHelper: state.voiceReaderHelper
    };

    Object.entries(toggleMap).forEach(([id, checked]) => {
      const el = document.getElementById(id);
      if (el) el.checked = !!checked;
    });

    // 5. Guía de Lectura
    if (this.readingGuideBar) {
      this.readingGuideBar.style.display = state.readingGuide ? 'block' : 'none';
    }
  }

  updateReadingGuidePosition(y) {
    if (this.readingGuideBar && this.readingGuideBar.style.display === 'block') {
      this.readingGuideBar.style.top = `${y - 19}px`;
    }
  }
}

window.AccessibilityView = AccessibilityView;
