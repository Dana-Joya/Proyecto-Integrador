/**
 * ==============================================================================
 * MODELO: Artwork / Artifact (ARQUITECTURA MVC + POO + ENTIDAD RELACIONAL)
 * ==============================================================================
 * 
 * @Entity
 * @Table(name = "artworks")
 * 
 * Mapeo Objeto-Relacional (ORM / JPA) para la gestión de piezas y artefactos patrimoniales.
 * Compatible con Node.js / MySQL y navegador web cliente.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  let pool = null;
  let SequenceHelper = null;
  let Museum = typeof window !== 'undefined' ? window.Museum : null;
  let BaseEntityClass = typeof window !== 'undefined' ? window.BaseEntity : null;

  if (isNode) {
    try {
      pool = require('../db').pool;
      BaseEntityClass = require('./BaseEntity');
      SequenceHelper = require('./SequenceHelper');
      Museum = require('./Museum');
    } catch (e) {}
  }

  class Artwork extends (BaseEntityClass || Object) {
    // ============================================================================
    // DEFINICIÓN DE TABLA Y COLUMNAS (ESTRUCTURA RELACIONAL / JPA)
    // ============================================================================
    static tableName = 'artworks';

    /**
     * Esquema de campos y columnas SQL de la tabla:
     * 
     * @Id
     * @GeneratedValue(strategy = GenerationType.IDENTITY)
     * private String/Long id;
     * 
     * @Column(name = "title", nullable = false)
     * public String title;
     * 
     * @Column(name = "description", nullable = false, columnDefinition = "TEXT")
     * public String description;
     * 
     * @Column(name = "image_url", nullable = false)
     * public String imageUrl; // o image
     * 
     * @Column(name = "created_at", nullable = false)
     * public LocalDateTime createdAt;
     * 
     * @Column(name = "acquired_at", nullable = false)
     * public String acquiredAt; // acquisitionDate
     * 
     * @Column(name = "condition_progress", nullable = false)
     * public int conditionProgress; // Porcentaje de conservación (0-100)
     * 
     * @ManyToOne
     * @JoinColumn(name = "category_id", nullable = false)
     * public Category category;
     * 
     * @ManyToOne
     * @JoinColumn(name = "artist_id")
     * public Artist artist; // Puede ser null si es anónima
     * 
     * @ManyToOne
     * @JoinColumn(name = "museum_id")
     * public Museum museum;
     */
    static columns = {
      id: { name: 'id', type: 'VARCHAR(50)', primaryKey: true, nullable: false },
      title: { name: 'title', type: 'VARCHAR(255)', nullable: false },
      artist: { name: 'artist', type: 'VARCHAR(255)', nullable: false },
      artist_id: { name: 'artist_id', type: 'VARCHAR(50)', nullable: true, references: 'artists(id)' },
      category: { name: 'category', type: 'VARCHAR(100)', nullable: false },
      creation_date: { name: 'creation_date', type: 'VARCHAR(100)', nullable: true },
      acquisition_date: { name: 'acquisition_date', type: 'VARCHAR(50)', nullable: true },
      conservation_percent: { name: 'conservation_percent', type: 'INT', nullable: false, default: 95 },
      room: { name: 'room', type: 'VARCHAR(255)', nullable: true },
      museum_id: { name: 'museum_id', type: 'VARCHAR(50)', nullable: true, references: 'museums(id)' },
      image: { name: 'image', type: 'TEXT', nullable: true },
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
          \`title\` VARCHAR(255) NOT NULL,
          \`artist\` VARCHAR(255) NOT NULL,
          \`artist_id\` VARCHAR(50) DEFAULT NULL,
          \`category\` VARCHAR(100) NOT NULL,
          \`creation_date\` VARCHAR(100) DEFAULT NULL,
          \`acquisition_date\` VARCHAR(50) DEFAULT NULL,
          \`conservation_percent\` INT NOT NULL DEFAULT 95,
          \`room\` VARCHAR(255) DEFAULT NULL,
          \`museum_id\` VARCHAR(50) DEFAULT NULL,
          \`image\` TEXT DEFAULT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_artworks_artist\` (\`artist_id\`),
          KEY \`idx_artworks_museum\` (\`museum_id\`),
          CONSTRAINT \`fk_artworks_museum\` FOREIGN KEY (\`museum_id\`) REFERENCES \`museums\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      await dbPool.query(sql);
    }

    // ============================================================================
    // CONSTRUCTOR Y PROPIEDADES DE ENTIDAD
    // ============================================================================
    constructor(data = {}) {
      super(data);

      this.title = data.title || '';
      this.artist = data.artist || '';
      this.artistId = data.artistId || data.artist_id || '';
      this.category = data.category || 'Pintura al Óleo';
      this.creationDate = data.creationDate || data.creation_date || '';
      
      // Soporta tanto acquiredAt / acquired_at como acquisitionDate / acquisition_date
      this.acquisitionDate = data.acquisitionDate || data.acquisition_date || data.acquiredAt || data.acquired_at || '';
      
      // Soporta conditionProgress / condition_progress y conservationPercent / conservation_percent
      this.conservationPercent = Number(
        data.conservationPercent ?? data.conservation_percent ?? data.conditionProgress ?? data.condition_progress ?? 95
      );
      
      this.room = data.room || '';
      this.museumId = data.museumId || data.museum_id || '';
      
      // Soporta image / image_url / imageUrl
      this.image = data.image || data.imageUrl || data.image_url || '';
      this.description = data.description || '';
    }

    // Compatibilidad con getters estilo Java / JPA
    get imageUrl() { return this.image; }
    set imageUrl(val) { this.image = val; }

    get conditionProgress() { return this.conservationPercent; }
    set conditionProgress(val) { this.conservationPercent = val; }

    get acquiredAt() { return this.acquisitionDate; }
    set acquiredAt(val) { this.acquisitionDate = val; }

    /**
     * Validación orientada a objetos (Polimorfismo)
     */
    validate() {
      super.validate();
      if (!this.title || this.title.trim().length === 0) {
        throw new Error('[Artwork] El título de la obra es un campo obligatorio.');
      }
      if (!this.artist || this.artist.trim().length === 0) {
        throw new Error('[Artwork] El artista o taller creador es obligatorio.');
      }
      if (isNaN(this.conservationPercent) || this.conservationPercent < 1 || this.conservationPercent > 100) {
        throw new Error('[Artwork] El porcentaje de conservación debe situarse entre 1 y 100.');
      }
      return true;
    }

    /**
     * Insignia para UI según nivel de conservación (Frontend)
     */
    getDisplayBadge() {
      if (this.conservationPercent >= 90) {
        return { text: `${this.conservationPercent}% Óptimo`, cssClass: 'badge-green' };
      } else if (this.conservationPercent >= 75) {
        return { text: `${this.conservationPercent}% Estable`, cssClass: 'badge-blue' };
      } else {
        return { text: `${this.conservationPercent}% En Monitoreo`, cssClass: 'badge-amber' };
      }
    }

    /**
     * Formateo de resumen textual
     */
    formatSummary() {
      return `"${this.title}" por ${this.artist} (${this.category})`;
    }

    getSummary() {
      return `Obra: "${this.title}" por ${this.artist} [${this.category}, ${this.conservationPercent}% conservación]`;
    }

    /**
     * Serialización JSON
     */
    toJSON() {
      return {
        ...super.toJSON(),
        title: this.title,
        artist: this.artist,
        artistId: this.artistId,
        category: this.category,
        creationDate: this.creationDate,
        acquisitionDate: this.acquisitionDate,
        conservationPercent: this.conservationPercent,
        room: this.room,
        museumId: this.museumId,
        image: this.image,
        description: this.description
      };
    }

    /**
     * Mapeo desde fila MySQL
     */
    static fromDatabaseRow(row) {
      if (!row) return null;
      return new Artwork({
        id: row.id,
        title: row.title,
        artist: row.artist,
        artistId: row.artist_id,
        category: row.category,
        creationDate: row.creation_date,
        acquisitionDate: row.acquisition_date || row.acquired_at,
        conservationPercent: row.conservation_percent || row.condition_progress,
        room: row.room,
        museumId: row.museum_id,
        image: row.image || row.image_url,
        description: row.description,
        createdAt: row.created_at
      });
    }

    // ============================================================================
    // OPERACIONES DE PERSISTENCIA MYSQL (BACKEND)
    // ============================================================================

    static async findAll() {
      if (!pool) return [];
      const [rows] = await pool.query('SELECT * FROM artworks ORDER BY LENGTH(id) ASC, id ASC');
      return rows.map(Artwork.fromDatabaseRow);
    }

    static async findById(id) {
      if (!pool) return null;
      const [rows] = await pool.query('SELECT * FROM artworks WHERE id = ?', [id]);
      return rows.length ? Artwork.fromDatabaseRow(rows[0]) : null;
    }

    static async create(data) {
      if (!pool) return null;
      const id = data.id || (await SequenceHelper.getNextId(pool, 'artworks', 'art'));
      const artworkInstance = new Artwork({ ...data, id });
      artworkInstance.validate();

      const title = artworkInstance.title;
      const artist = artworkInstance.artist;
      const artistId = artworkInstance.artistId || null;
      const category = artworkInstance.category || 'Pintura al Óleo';
      const creationDate = artworkInstance.creationDate || 'Siglo XXI';
      const acquisitionDate = artworkInstance.acquisitionDate || new Date().toISOString().split('T')[0];
      const conservationPercent = artworkInstance.conservationPercent;
      const room = artworkInstance.room || 'Sala Principal';
      const museumId = artworkInstance.museumId || null;
      const image = artworkInstance.image || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';
      const description = artworkInstance.description || '';

      await pool.query(
        `INSERT INTO artworks (id, title, artist, artist_id, category, creation_date, acquisition_date, conservation_percent, room, museum_id, image, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, title, artist, artistId, category, creationDate, acquisitionDate, conservationPercent, room, museumId, image, description]
      );

      if (museumId && Museum && Museum.incrementWorkCount) {
        await Museum.incrementWorkCount(museumId);
      }

      return Artwork.findById(id);
    }

    static async updateConservation(id, percent) {
      if (!pool) return null;
      await pool.query('UPDATE artworks SET conservation_percent = ? WHERE id = ?', [percent, id]);
      return Artwork.findById(id);
    }

    static async update(id, data) {
      if (!pool) return null;
      const current = await Artwork.findById(id);
      if (!current) return null;

      const updated = new Artwork({ ...current.toJSON(), ...data, id });
      updated.validate();

      await pool.query(
        `UPDATE artworks SET 
          title = ?, artist = ?, artist_id = ?, category = ?, 
          creation_date = ?, acquisition_date = ?, conservation_percent = ?, 
          room = ?, museum_id = ?, image = ?, description = ?
         WHERE id = ?`,
        [
          updated.title, updated.artist, updated.artistId || null, updated.category,
          updated.creationDate, updated.acquisitionDate, updated.conservationPercent,
          updated.room, updated.museumId || null, updated.image, updated.description,
          id
        ]
      );

      return Artwork.findById(id);
    }
  }

  // Exportación frontend
  if (typeof window !== 'undefined') {
    window.Artwork = Artwork;
    window.ArtworkModel = Artwork;
    window.Artifact = Artwork;
  }

  // Exportación backend
  if (isNode) {
    module.exports = Artwork;
  }
})();
