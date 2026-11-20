/**
 * ==============================================================================
 * MODELO: Category (ARQUITECTURA MVC + POO + ENTIDAD RELACIONAL)
 * ==============================================================================
 * 
 * @Entity
 * @Table(name = "categories")
 * 
 * Mapeo Objeto-Relacional (ORM / JPA) para categorías patrimoniales de obras.
 * Compatible con Node.js / MySQL y navegador web cliente.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  let pool = null;
  let SequenceHelper = null;
  let BaseEntityClass = typeof window !== 'undefined' ? window.BaseEntity : null;

  if (isNode) {
    try {
      pool = require('../db').pool;
      BaseEntityClass = require('./BaseEntity');
      SequenceHelper = require('./SequenceHelper');
    } catch (e) {}
  }

  class Category extends (BaseEntityClass || Object) {
    // ============================================================================
    // DEFINICIÓN DE TABLA Y COLUMNAS (ESTRUCTURA RELACIONAL / JPA)
    // ============================================================================
    static tableName = 'categories';

    /**
     * Esquema de campos y columnas SQL de la tabla:
     * 
     * @Id
     * @GeneratedValue(strategy = GenerationType.IDENTITY)
     * private Long id;
     * 
     * @Column(name = "name", nullable = false)
     * public String name;
     * 
     * @Column(name = "description", nullable = true, columnDefinition = "TEXT")
     * public String description;
     * 
     * @Column(name = "created_at", nullable = false)
     * public LocalDateTime createdAt;
     */
    static columns = {
      id: { name: 'id', type: 'VARCHAR(50)', primaryKey: true, nullable: false },
      name: { name: 'name', type: 'VARCHAR(100)', nullable: false },
      description: { name: 'description', type: 'TEXT', nullable: true },
      created_at: { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP', nullable: false }
    };

    /**
     * Generación y Creación de la Tabla en MySQL
     */
    static async createTable(dbPool = pool) {
      if (!dbPool) return;
      const sql = `
        CREATE TABLE IF NOT EXISTS \`${this.tableName}\` (
          \`id\` VARCHAR(50) NOT NULL,
          \`name\` VARCHAR(100) NOT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      await dbPool.query(sql);
    }

    // ============================================================================
    // CONSTRUCTOR Y PROPIEDADES DE ENTIDAD
    // ============================================================================
    constructor(data = {}) {
      super(data);

      this.name = data.name || '';
      this.description = data.description || '';
    }

    validate() {
      super.validate();
      if (!this.name || this.name.trim().length === 0) {
        throw new Error('[Category] El nombre de la categoría es obligatorio.');
      }
      return true;
    }

    getDisplayBadge() {
      return {
        text: this.name,
        cssClass: 'badge-blue'
      };
    }

    formatSummary() {
      return `Categoría: ${this.name}`;
    }

    getSummary() {
      return `Categoría: "${this.name}" [ID: ${this.id}]`;
    }

    toJSON() {
      return {
        ...super.toJSON(),
        name: this.name,
        description: this.description
      };
    }

    static fromDatabaseRow(row) {
      if (!row) return null;
      return new Category({
        id: row.id,
        name: row.name,
        description: row.description,
        createdAt: row.created_at
      });
    }

    // ============================================================================
    // OPERACIONES DE PERSISTENCIA MYSQL (BACKEND)
    // ============================================================================

    static async findAll() {
      if (!pool) return [];
      const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
      return rows.map(Category.fromDatabaseRow);
    }

    static async findById(id) {
      if (!pool) return null;
      const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
      return rows.length ? Category.fromDatabaseRow(rows[0]) : null;
    }

    static async create(data) {
      if (!pool) return null;
      const id = data.id || (await SequenceHelper.getNextId(pool, 'categories', 'cat'));
      const categoryInstance = new Category({ ...data, id });
      categoryInstance.validate();

      await pool.query(
        `INSERT INTO categories (id, name, description) VALUES (?, ?, ?)`,
        [id, categoryInstance.name, categoryInstance.description || '']
      );

      return Category.findById(id);
    }
  }

  // Exportación frontend
  if (typeof window !== 'undefined') {
    window.Category = Category;
  }

  // Exportación backend
  if (isNode) {
    module.exports = Category;
  }
})();
