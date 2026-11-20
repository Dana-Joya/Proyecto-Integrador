/**
 * ==============================================================================
 * CLASE BASE: BaseEntity (POO - HERENCIA, POLIMORFISMO Y SOBREESCRITURA)
 * Superclase universal de la que heredan todas las entidades del dominio patrimonial
 * (Museum, Artwork, Room, Artist, Tour, Category).
 * Compatible tanto con el Backend (Node.js/MySQL) como con el Frontend (Navegador).
 * ==============================================================================
 */

class BaseEntity {
  /**
   * Constructor base
   * @param {Object} data - Datos iniciales de la entidad
   */
  constructor(data = {}) {
    this.id = data.id || (data._id ? String(data._id) : null);
    this.createdAt = data.createdAt || data.created_at || new Date().toISOString();
  }

  /**
   * Validaciones generales de la entidad.
   * Método polimórfico: cada subclase lo sobreescribe para validar sus propios campos obligatorios.
   * @returns {boolean} Retorna true si es válido, lanza Error si no cumple.
   */
  validate() {
    if (typeof this.id === 'string' && this.id.trim() === '') {
      this.id = null;
    }
    return true;
  }

  /**
   * Insignia representativa de la entidad para componentes UI (Polimorfismo).
   * Cada subclase sobreescribe este método para determinar su color y etiqueta.
   * @returns {{ text: string, cssClass: string }}
   */
  getDisplayBadge() {
    return {
      text: 'Registrado',
      cssClass: 'badge-blue'
    };
  }

  /**
   * Formatea un resumen textual de la entidad para interfaz gráfica (Polimorfismo).
   * @returns {string}
   */
  formatSummary() {
    return `[${this.constructor.name} #${this.id}]`;
  }

  /**
   * Retorna un resumen representativo de la entidad (Polimorfismo).
   * @returns {string} Resumen textual descriptivo
   */
  getSummary() {
    return `[${this.constructor.name} ID: ${this.id || 'NUEVO'}]`;
  }

  /**
   * Retorna una entrada de auditoría para la bitácora patrimonial.
   * @param {string} action - Acción realizada (Creación, Modificación, Inspección)
   * @returns {Object} Registro de auditoría
   */
  getAuditLog(action = 'Modificación') {
    return {
      entityType: this.constructor.name,
      entityId: this.id,
      action,
      summary: this.getSummary(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Serialización polimórfica a objeto simple JSON.
   * Cada subclase lo sobreescribe llamando a super.toJSON() para componer sus datos.
   * @returns {Object} Representación JSON de la entidad
   */
  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt
    };
  }

  /**
   * Mapeo estático polimórfico de fila de base de datos a instancia.
   * @param {Object} row - Fila cruda de MySQL
   * @returns {BaseEntity|null}
   */
  static fromDatabaseRow(row) {
    if (!row) return null;
    return new this(row);
  }
}

// Exportación para navegador (Frontend)
if (typeof window !== 'undefined') {
  window.BaseEntity = BaseEntity;
}

// Exportación para Node.js (Backend)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseEntity;
}
