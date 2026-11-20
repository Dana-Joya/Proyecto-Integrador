/**
 * ==============================================================================
 * MODELO: Artist (ARQUITECTURA MVC + POO + ENTIDAD RELACIONAL)
 * ==============================================================================
 * 
 * @Entity
 * @Table(name = "artists")
 * 
 * Mapeo Objeto-Relacional (ORM / JPA) para artistas y colectivos patrimoniales.
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

  class Artist extends (BaseEntityClass || Object) {
    // ============================================================================
    // DEFINICIÓN DE TABLA Y COLUMNAS (ESTRUCTURA RELACIONAL / JPA)
    // ============================================================================
    static tableName = 'artists';

    
    static columns = {
      id: { name: 'id', type: 'VARCHAR(50)', primaryKey: true, nullable: false },
      name: { name: 'name', type: 'VARCHAR(255)', nullable: false },
      period: { name: 'period', type: 'VARCHAR(255)', nullable: true },
      nationality: { name: 'nationality', type: 'VARCHAR(150)', nullable: true },
      bio: { name: 'bio', type: 'TEXT', nullable: true },
      works_count: { name: 'works_count', type: 'INT', nullable: false, default: 0 },
      avatar: { name: 'avatar', type: 'TEXT', nullable: true },
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
          \`period\` VARCHAR(255) DEFAULT NULL,
          \`nationality\` VARCHAR(150) DEFAULT NULL,
          \`bio\` TEXT DEFAULT NULL,
          \`works_count\` INT NOT NULL DEFAULT 0,
          \`avatar\` TEXT DEFAULT NULL,
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
      this.period = data.period || '';
      this.nationality = data.nationality || '';
      this.bio = data.bio || '';
      this.worksCount = Number(data.worksCount || data.works_count || 0);
      this.avatar = data.avatar || '';
    }

    /**
     * Validación orientada a objetos (Polimorfismo)
     */
    validate() {
      super.validate();
      if (!this.name || this.name.trim().length === 0) {
        throw new Error('[Artist] El nombre del artista o taller creador es obligatorio.');
      }
      if (!this.bio || this.bio.trim().length === 0) {
        this.bio = 'Sin reseña biográfica registrada.';
      }
      return true;
    }

    /**
     * Insignia representativa para tarjetas UI (Frontend)
     */
    getDisplayBadge() {
      return {
        text: `${this.worksCount} Obras`,
        cssClass: 'badge-violet'
      };
    }

    /**
     * Resumen textual para frontend
     */
    formatSummary() {
      return `${this.name} [${this.nationality || 'General'}]`;
    }

    getSummary() {
      return `Artista: "${this.name}" [${this.nationality || 'Sin nacionalidad'}, ${this.period || 'Época general'}]`;
    }

    /**
     * Serialización JSON
     */
    toJSON() {
      return {
        ...super.toJSON(),
        name: this.name,
        period: this.period,
        nationality: this.nationality,
        bio: this.bio,
        worksCount: this.worksCount,
        avatar: this.avatar
      };
    }

    /**
     * Mapeo estático desde fila MySQL
     */
    static fromDatabaseRow(row) {
      if (!row) return null;
      return new Artist({
        id: row.id,
        name: row.name,
        period: row.period,
        nationality: row.nationality,
        bio: row.bio,
        worksCount: row.works_count,
        avatar: row.avatar,
        createdAt: row.created_at
      });
    }

    // ============================================================================
    // OPERACIONES DE PERSISTENCIA MYSQL (BACKEND)
    // ============================================================================

    static async findAll() {
      if (!pool) return [];
      const [rows] = await pool.query('SELECT * FROM artists ORDER BY LENGTH(id) ASC, id ASC');
      return rows.map(Artist.fromDatabaseRow);
    }

    static async findById(id) {
      if (!pool) return null;
      const [rows] = await pool.query('SELECT * FROM artists WHERE id = ?', [id]);
      return rows.length ? Artist.fromDatabaseRow(rows[0]) : null;
    }

    static async create(data) {
      if (!pool) return null;
      const id = data.id || (await SequenceHelper.getNextId(pool, 'artists', 'art'));
      const artistInstance = new Artist({ ...data, id });
      artistInstance.validate();

      const name = artistInstance.name;
      const period = artistInstance.period || 'Arte Contemporáneo';
      const nationality = artistInstance.nationality || 'Colombiana';
      const bio = artistInstance.bio;
      const worksCount = artistInstance.worksCount || 0;
      const avatar = artistInstance.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

      await pool.query(
        `INSERT INTO artists (id, name, period, nationality, bio, works_count, avatar)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, period, nationality, bio, worksCount, avatar]
      );

      return Artist.findById(id);
    }

    static async update(id, data) {
      if (!pool) return null;
      const current = await Artist.findById(id);
      if (!current) return null;

      const updated = new Artist({ ...current.toJSON(), ...data, id });
      updated.validate();

      await pool.query(
        `UPDATE artists SET 
          name = ?, period = ?, nationality = ?, bio = ?, works_count = ?, avatar = ?
         WHERE id = ?`,
        [
          updated.name, updated.period, updated.nationality, updated.bio,
          updated.worksCount, updated.avatar,
          id
        ]
      );

      return Artist.findById(id);
    }
  }

  // Exportación frontend
  if (typeof window !== 'undefined') {
    window.Artist = Artist;
    window.ArtistModel = Artist;
  }

  // Exportación backend
  if (isNode) {
    module.exports = Artist;
  }
})();
