/**
 * ==============================================================================
 * MODELO: AccessibilityModel (POO)
 * Gestiona el estado y la persistencia en localStorage de las preferencias
 * de accesibilidad y adaptación visual del usuario.
 * ==============================================================================
 */

class AccessibilityModel {
  static STORAGE_KEY = 'patrimonia_accessibility_prefs';

  constructor() {
    this.defaults = {
      fontScale: 1,           // 1 (100%), 1.15 (115%), 1.3 (130%), 1.5 (150%)
      contrastMode: 'normal', // 'normal','high-contrast-dark','high-contrast-light','monochrome','invert-colors','dark-mode'
      dyslexicFont: false,
      textSpacing: false,
      highlightLinks: false,
      largeCursor: false,
      reduceMotion: false,
      readingGuide: false,
      // Visión
      colorblindMode: 'none', // 'none','protanopia','deuteranopia','tritanopia'
      // Cognición & Concentración
      cognitiveMode: false,
      focusMode: false,
      // Motor & Interacción
      largeButtons: false,
      // Auditivo
      hearingImpairment: false,
      voiceReaderHelper: false
    };

    this.state = this.load();
    this.listeners = [];
  }

  /**
   * Carga preferencias desde localStorage o asigna valores por defecto
   */
  load() {
    try {
      const saved = localStorage.getItem(AccessibilityModel.STORAGE_KEY);
      if (saved) {
        return { ...this.defaults, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[AccessibilityModel] No se pudo leer de localStorage:', e);
    }
    return { ...this.defaults };
  }

  /**
   * Guarda las preferencias en localStorage
   */
  save() {
    try {
      localStorage.setItem(AccessibilityModel.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('[AccessibilityModel] No se pudo escribir en localStorage:', e);
    }
    this.notify();
  }

  /**
   * Actualiza una propiedad específica
   */
  set(key, value) {
    if (key in this.defaults) {
      this.state[key] = value;
      this.save();
    }
  }

  /**
   * Restablece todas las opciones a los valores por defecto
   */
  reset() {
    this.state = { ...this.defaults };
    this.save();
  }

  /**
   * Suscribe un callback ante cambios de estado
   */
  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.state);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.state));
  }
}

// Exportación global para entorno navegador y Node.js
if (typeof window !== 'undefined') {
  window.AccessibilityModel = AccessibilityModel;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityModel;
}
