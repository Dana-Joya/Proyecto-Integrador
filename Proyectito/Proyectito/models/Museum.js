/**
 * ==============================================================================
 * MODELO: Museum (ARQUITECTURA MVC + POO + ENTIDAD RELACIONAL)
 * ==============================================================================
 * 
 * @Entity
 * @Table(name = "museums")
 * 
 * Mapeo Objeto-Relacional (ORM / JPA) para sedes e instituciones museísticas.
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

  class Museum extends (BaseEntityClass || Object) {
    // ============================================================================
    // DEFINICIÓN DE TABLA Y COLUMNAS (ESTRUCTURA RELACIONAL / JPA)
    // ============================================================================
    static tableName = 'museums';

    /**
     * Esquema de campos y columnas SQL de la tabla:
     * 
     * @Id
     * @GeneratedValue(strategy = GenerationType.IDENTITY)
     * private String/Long id;
     * 
     * @Column(name = "name", nullable = false)
     * public String name;
     * 
     * @Column(name = "description", nullable = false, columnDefinition = "TEXT")
     * public String description;
     * 
     * @Column(name = "location", nullable = false)
     * public String location;
     * 
     * @Column(name = "coordinates", nullable = true)
     * public String coordinates;
     * 
     * @Column(name = "web_url", nullable = true)
     * public String webUrl;
     * 
     * @Column(name = "image", nullable = true, columnDefinition = "TEXT")
     * public String image;
     * 
     * @Column(name = "total_works", nullable = false)
     * public int totalWorks;
     * 
     * @Column(name = "active_rooms", nullable = false)
     * public int activeRooms;
     * 
     * @Column(name = "founded_year", nullable = true)
     * public int foundedYear;
     * 
     * @Column(name = "created_at", nullable = false)
     * public LocalDateTime createdAt;
     */
    static columns = {
      id: { name: 'id', type: 'VARCHAR(50)', primaryKey: true, nullable: false },
      name: { name: 'name', type: 'VARCHAR(255)', nullable: false },
      description: { name: 'description', type: 'TEXT', nullable: false },
      location: { name: 'location', type: 'VARCHAR(255)', nullable: false },
      coordinates: { name: 'coordinates', type: 'VARCHAR(100)', nullable: true },
      web_url: { name: 'web_url', type: 'VARCHAR(255)', nullable: true },
      image: { name: 'image', type: 'TEXT', nullable: true },
      total_works: { name: 'total_works', type: 'INT', nullable: false, default: 0 },
      active_rooms: { name: 'active_rooms', type: 'INT', nullable: false, default: 1 },
      founded_year: { name: 'founded_year', type: 'INT', nullable: true, default: 2000 },
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
          \`name\` VARCHAR(255) NOT NULL,
          \`description\` TEXT NOT NULL,
          \`location\` VARCHAR(255) NOT NULL,
          \`coordinates\` VARCHAR(100) DEFAULT NULL,
          \`web_url\` VARCHAR(255) DEFAULT NULL,
          \`image\` TEXT DEFAULT NULL,
          \`total_works\` INT NOT NULL DEFAULT 0,
          \`active_rooms\` INT NOT NULL DEFAULT 1,
          \`founded_year\` INT DEFAULT 2000,
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
      this.location = data.location || '';
      this.coordinates = data.coordinates || '';
      this.webUrl = data.webUrl || data.web_url || '';
      this.image = data.image || '';
      this.totalWorks = Number(data.totalWorks || data.total_works || 0);
      this.activeRooms = Number(data.activeRooms || data.active_rooms || 1);
      this.foundedYear = Number(data.foundedYear || data.founded_year || 2000);
    }

    /**
     * Validación orientada a objetos (Polimorfismo)
     */
    validate() {
      super.validate();
      if (!this.name || this.name.trim().length === 0) {
        throw new Error('[Museum] El nombre de la sede museística es obligatorio.');
      }
      if (!this.location || this.location.trim().length === 0) {
        throw new Error('[Museum] La ubicación de la sede es obligatoria.');
      }
      return true;
    }

    /**
     * Insignia representativa de la tarjeta UI
     */
    getDisplayBadge() {
      return {
        text: `${this.totalWorks} Obras`,
        cssClass: 'badge-violet'
      };
    }

    /**
     * Resumen textual para frontend
     */
    formatSummary() {
      return `${this.name} (${this.location})`;
    }

    getSummary() {
      return `Sede: "${this.name}" en ${this.location} [${this.totalWorks} obras en custodia, ${this.activeRooms} salas]`;
    }

    /**
     * Serialización JSON
     */
    toJSON() {
      return {
        ...super.toJSON(),
        name: this.name,
        description: this.description,
        location: this.location,
        coordinates: this.coordinates,
        webUrl: this.webUrl,
        image: this.image,
        totalWorks: this.totalWorks,
        activeRooms: this.activeRooms,
        foundedYear: this.foundedYear
      };
    }

    /**
     * Mapeo estático desde fila MySQL
     */
    static fromDatabaseRow(row) {
      if (!row) return null;
      return new Museum({
        id: row.id,
        name: row.name,
        description: row.description,
        location: row.location,
        coordinates: row.coordinates,
        webUrl: row.web_url,
        image: row.image,
        totalWorks: row.total_works,
        activeRooms: row.active_rooms,
        foundedYear: row.founded_year,
        createdAt: row.created_at
      });
    }

    // ============================================================================
    // OPERACIONES DE PERSISTENCIA MYSQL (BACKEND)
    // ============================================================================

    static async findAll() {
      if (!pool) return [];
      const [rows] = await pool.query('SELECT * FROM museums ORDER BY LENGTH(id) ASC, id ASC');
      return rows.map(Museum.fromDatabaseRow);
    }

    static async findById(id) {
      if (!pool) return null;
      const [rows] = await pool.query('SELECT * FROM museums WHERE id = ?', [id]);
      return rows.length ? Museum.fromDatabaseRow(rows[0]) : null;
    }

    static async create(data) {
      if (!pool) return null;
      const id = data.id || (await SequenceHelper.getNextId(pool, 'museums', 'mus'));
      const museumInstance = new Museum({ ...data, id });
      museumInstance.validate();

      const name = museumInstance.name;
      const description = museumInstance.description || 'Institución cultural dedicada a la preservación del patrimonio.';
      const location = museumInstance.location;
      const coordinates = museumInstance.coordinates || '4.6097° N, 74.0817° W';
      const webUrl = museumInstance.webUrl || '#';
      const image = museumInstance.image || 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80';
      const totalWorks = museumInstance.totalWorks || 0;
      const activeRooms = museumInstance.activeRooms || 1;
      const foundedYear = museumInstance.foundedYear || 2000;

      await pool.query(
        `INSERT INTO museums (id, name, description, location, coordinates, web_url, image, total_works, active_rooms, founded_year)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, description, location, coordinates, webUrl, image, totalWorks, activeRooms, foundedYear]
      );

      return Museum.findById(id);
    }

    static async update(id, data) {
      if (!pool) return null;
      const current = await Museum.findById(id);
      if (!current) return null;

      const updated = new Museum({ ...current.toJSON(), ...data, id });
      updated.validate();

      await pool.query(
        `UPDATE museums SET 
          name = ?, description = ?, location = ?, coordinates = ?, 
          web_url = ?, image = ?, total_works = ?, active_rooms = ?, founded_year = ?
         WHERE id = ?`,
        [
          updated.name, updated.description, updated.location, updated.coordinates,
          updated.webUrl, updated.image, updated.totalWorks, updated.activeRooms, updated.foundedYear,
          id
        ]
      );

      return Museum.findById(id);
    }

    static async incrementWorkCount(museumId) {
      if (!pool) return;
      try {
        await pool.query('UPDATE museums SET total_works = total_works + 1 WHERE id = ?', [museumId]);
      } catch (e) {
        console.warn('[Museum] No se pudo incrementar el contador de obras:', e.message);
      }
    }
  }

  // Exportación frontend
  if (typeof window !== 'undefined') {
    window.Museum = Museum;
    window.MuseumModel = Museum;
  }

  // Exportación backend
  if (isNode) {
    module.exports = Museum;
  }
})();
