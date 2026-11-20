/**
 * ==============================================================================
 * MODELO: Room / ExhibitionRoom (ARQUITECTURA MVC + POO + ENTIDAD RELACIONAL)
 * ==============================================================================
 * 
 * @Entity
 * @Table(name = "rooms")
 * 
 * Mapeo Objeto-Relacional (ORM / JPA) para salas de exposición climatizadas.
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

  class Room extends (BaseEntityClass || Object) {
    // ============================================================================
    // DEFINICIÓN DE TABLA Y COLUMNAS (ESTRUCTURA RELACIONAL / JPA)
    // ============================================================================
    static tableName = 'rooms';

    /**
     * Esquema de campos y columnas SQL de la tabla:
     * 
     * @Id
     * @GeneratedValue(strategy = GenerationType.IDENTITY)
     * private String/Long id;
     * 
     * @Column(name = "code", nullable = false)
     * public String code;
     * 
     * @Column(name = "name", nullable = false)
     * public String name;
     * 
     * @Column(name = "museum_name", nullable = true)
     * public String museumName;
     * 
     * @ManyToOne
     * @JoinColumn(name = "museum_id", nullable = true)
     * public Museum museum;
     * 
     * @Column(name = "capacity", nullable = false)
     * public int capacity;
     * 
     * @Column(name = "current_pieces", nullable = false)
     * public int currentPieces;
     * 
     * @Column(name = "climate_control", nullable = true)
     * public String climateControl;
     * 
     * @Column(name = "status", nullable = false)
     * public String status;
     * 
     * @Column(name = "created_at", nullable = false)
     * public LocalDateTime createdAt;
     */
    static columns = {
      id: { name: 'id', type: 'VARCHAR(50)', primaryKey: true, nullable: false },
      code: { name: 'code', type: 'VARCHAR(50)', nullable: false },
      name: { name: 'name', type: 'VARCHAR(255)', nullable: false },
      museum_name: { name: 'museum_name', type: 'VARCHAR(255)', nullable: true },
      museum_id: { name: 'museum_id', type: 'VARCHAR(50)', nullable: true, references: 'museums(id)' },
      capacity: { name: 'capacity', type: 'INT', nullable: false, default: 30 },
      current_pieces: { name: 'current_pieces', type: 'INT', nullable: false, default: 0 },
      climate_control: { name: 'climate_control', type: 'VARCHAR(100)', nullable: true, default: '20.0°C · 50% HR' },
      status: { name: 'status', type: 'VARCHAR(100)', nullable: false, default: 'Abierta al Público' },
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
          \`code\` VARCHAR(50) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`museum_name\` VARCHAR(255) DEFAULT NULL,
          \`museum_id\` VARCHAR(50) DEFAULT NULL,
          \`capacity\` INT NOT NULL DEFAULT 30,
          \`current_pieces\` INT NOT NULL DEFAULT 0,
          \`climate_control\` VARCHAR(100) DEFAULT '20.0°C · 50% HR',
          \`status\` VARCHAR(100) NOT NULL DEFAULT 'Abierta al Público',
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_rooms_museum\` (\`museum_id\`),
          CONSTRAINT \`fk_rooms_museum\` FOREIGN KEY (\`museum_id\`) REFERENCES \`museums\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      await dbPool.query(sql);
    }

    // ============================================================================
    // CONSTRUCTOR Y PROPIEDADES DE ENTIDAD
    // ============================================================================
    constructor(data = {}) {
      super(data);

      this.code = data.code || 'R-00';
      this.name = data.name || '';
      this.museumName = data.museumName || data.museum_name || '';
      this.museumId = data.museumId || data.museum_id || '';
      this.capacity = Number(data.capacity || 30);
      this.currentPieces = Number(data.currentPieces || data.current_pieces || 0);
      this.climateControl = data.climateControl || data.climate_control || '20.0°C · 50% HR';
      this.status = data.status || 'Abierta al Público';
    }

    /**
     * Validación orientada a objetos (Polimorfismo)
     */
    validate() {
      super.validate();
      if (!this.code || this.code.trim().length === 0) {
        throw new Error('[Room] El código de sala (ej: R-102) es obligatorio.');
      }
      if (!this.name || this.name.trim().length === 0) {
        throw new Error('[Room] La denominación de la sala es obligatoria.');
      }
      if (isNaN(this.capacity) || this.capacity < 1) {
        throw new Error('[Room] La capacidad de aforo debe ser mayor a 0.');
      }
      return true;
    }

    /**
     * Insignia representativa de la tarjeta UI (Frontend)
     */
    getDisplayBadge() {
      const isRestricted = this.status.toLowerCase().includes('restringid') || this.status.toLowerCase().includes('mantenimiento');
      return {
        text: this.status,
        cssClass: isRestricted ? 'badge-amber' : 'badge-green'
      };
    }

    /**
     * Resumen textual para frontend
     */
    formatSummary() {
      return `${this.code} - ${this.name} (${this.capacity} personas)`;
    }

    getSummary() {
      return `Sala: [${this.code}] "${this.name}" (Aforo: ${this.capacity}, Estado: ${this.status})`;
    }

    /**
     * Serialización JSON
     */
    toJSON() {
      return {
        ...super.toJSON(),
        code: this.code,
        name: this.name,
        museumName: this.museumName,
        museumId: this.museumId,
        capacity: this.capacity,
        currentPieces: this.currentPieces,
        climateControl: this.climateControl,
        status: this.status
      };
    }

    /**
     * Mapeo estático desde fila MySQL
     */
    static fromDatabaseRow(row) {
      if (!row) return null;
      return new Room({
        id: row.id,
        code: row.code,
        name: row.name,
        museumName: row.museum_name,
        museumId: row.museum_id,
        capacity: row.capacity,
        currentPieces: row.current_pieces,
        climateControl: row.climate_control,
        status: row.status,
        createdAt: row.created_at
      });
    }

    // ============================================================================
    // OPERACIONES DE PERSISTENCIA MYSQL (BACKEND)
    // ============================================================================

    static async findAll() {
      if (!pool) return [];
      const [rows] = await pool.query('SELECT * FROM rooms ORDER BY LENGTH(id) ASC, id ASC');
      return rows.map(Room.fromDatabaseRow);
    }

    static async findById(id) {
      if (!pool) return null;
      const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
      return rows.length ? Room.fromDatabaseRow(rows[0]) : null;
    }

    static async create(data) {
      if (!pool) return null;
      const id = data.id || (await SequenceHelper.getNextId(pool, 'rooms', 'room'));
      const roomInstance = new Room({ ...data, id });
      roomInstance.validate();

      const code = roomInstance.code;
      const name = roomInstance.name;
      const museumName = roomInstance.museumName || 'Museo Nacional de Colombia';
      const museumId = roomInstance.museumId || null;
      const capacity = roomInstance.capacity || 30;
      const currentPieces = roomInstance.currentPieces || 0;
      const climateControl = roomInstance.climateControl || '20.0°C · 50% HR';
      const status = roomInstance.status || 'Abierta al Público';

      await pool.query(
        `INSERT INTO rooms (id, code, name, museum_name, museum_id, capacity, current_pieces, climate_control, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, code, name, museumName, museumId, capacity, currentPieces, climateControl, status]
      );

      return Room.findById(id);
    }

    static async update(id, data) {
      if (!pool) return null;
      const current = await Room.findById(id);
      if (!current) return null;

      const updated = new Room({ ...current.toJSON(), ...data, id });
      updated.validate();

      await pool.query(
        `UPDATE rooms SET 
          code = ?, name = ?, museum_name = ?, museum_id = ?, 
          capacity = ?, current_pieces = ?, climate_control = ?, status = ?
         WHERE id = ?`,
        [
          updated.code, updated.name, updated.museumName, updated.museumId || null,
          updated.capacity, updated.currentPieces, updated.climateControl, updated.status,
          id
        ]
      );

      return Room.findById(id);
    }
  }

  // Exportación frontend
  if (typeof window !== 'undefined') {
    window.Room = Room;
    window.RoomModel = Room;
    window.ExhibitionRoom = Room;
  }

  // Exportación backend
  if (isNode) {
    module.exports = Room;
  }
})();
