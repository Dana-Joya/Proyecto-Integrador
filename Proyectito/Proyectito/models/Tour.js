/**
 * ==============================================================================
 * MODELO: Tour (ARQUITECTURA MVC + POO + ENTIDAD RELACIONAL)
 * ==============================================================================
 * 
 * @Entity
 * @Table(name = "tours")
 * 
 * Mapeo Objeto-Relacional (ORM / JPA) para visitas guiadas e itinerarios de salas.
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

  class Tour extends (BaseEntityClass || Object) {
    // ============================================================================
    // DEFINICIÓN DE TABLA Y COLUMNAS (ESTRUCTURA RELACIONAL / JPA)
    // ============================================================================
    static tableName = 'tours';

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
     * @Column(name = "guide", nullable = false)
     * public String guide;
     * 
     * @Column(name = "date_time", nullable = true)
     * public String dateTime;
     * 
     * @Column(name = "duration", nullable = true)
     * public String duration;
     * 
     * @Column(name = "registered_attendees", nullable = false)
     * public int registeredAttendees;
     * 
     * @Column(name = "max_capacity", nullable = false)
     * public int maxCapacity;
     * 
     * @Column(name = "language", nullable = false)
     * public String language;
     * 
     * @Column(name = "created_at", nullable = false)
     * public LocalDateTime createdAt;
     * 
     * @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL)
     * public List<TourItinerary> itinerary;
     */
    static columns = {
      id: { name: 'id', type: 'VARCHAR(50)', primaryKey: true, nullable: false },
      title: { name: 'title', type: 'VARCHAR(255)', nullable: false },
      guide: { name: 'guide', type: 'VARCHAR(255)', nullable: false },
      date_time: { name: 'date_time', type: 'VARCHAR(100)', nullable: true },
      duration: { name: 'duration', type: 'VARCHAR(50)', nullable: true, default: '60 min' },
      registered_attendees: { name: 'registered_attendees', type: 'INT', nullable: false, default: 0 },
      max_capacity: { name: 'max_capacity', type: 'INT', nullable: false, default: 25 },
      language: { name: 'language', type: 'VARCHAR(50)', nullable: false, default: 'Español' },
      created_at: { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP', nullable: false }
    };

    /**
     * Generación y Creación de las Tablas en MySQL
     */
    static async createTable(dbPool = pool) {
      if (!dbPool) return;
      const sqlTours = `
        CREATE TABLE IF NOT EXISTS \`${this.tableName}\` (
          \`id\` VARCHAR(50) NOT NULL,
          \`title\` VARCHAR(255) NOT NULL,
          \`guide\` VARCHAR(255) NOT NULL,
          \`date_time\` VARCHAR(100) DEFAULT NULL,
          \`duration\` VARCHAR(50) DEFAULT '60 min',
          \`registered_attendees\` INT NOT NULL DEFAULT 0,
          \`max_capacity\` INT NOT NULL DEFAULT 25,
          \`language\` VARCHAR(50) DEFAULT 'Español',
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;

      const sqlItinerary = `
        CREATE TABLE IF NOT EXISTS \`tour_itineraries\` (
          \`id\` INT AUTO_INCREMENT NOT NULL,
          \`tour_id\` VARCHAR(50) NOT NULL,
          \`step_order\` INT NOT NULL,
          \`room_name\` VARCHAR(255) NOT NULL,
          \`duration_min\` INT NOT NULL DEFAULT 15,
          \`focus\` VARCHAR(255) DEFAULT NULL,
          PRIMARY KEY (\`id\`),
          KEY \`idx_itinerary_tour\` (\`tour_id\`),
          CONSTRAINT \`fk_itinerary_tour\` FOREIGN KEY (\`tour_id\`) REFERENCES \`tours\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;

      await dbPool.query(sqlTours);
      await dbPool.query(sqlItinerary);
    }

    // ============================================================================
    // CONSTRUCTOR Y PROPIEDADES DE ENTIDAD
    // ============================================================================
    constructor(data = {}, itinerary = []) {
      super(data);

      this.title = data.title || '';
      this.guide = data.guide || '';
      this.dateTime = data.dateTime || data.date_time || '';
      this.duration = data.duration || '60 min';
      this.registeredAttendees = Number(data.registeredAttendees || data.registered_attendees || 0);
      this.maxCapacity = Number(data.maxCapacity || data.max_capacity || 25);
      this.language = data.language || 'Español';
      
      const rawItin = Array.isArray(itinerary) && itinerary.length > 0
        ? itinerary
        : (Array.isArray(data.itinerary) ? data.itinerary : []);

      this.itinerary = rawItin.map(step => ({
        step: Number(step.step_order || step.step || 1),
        roomName: step.room_name || step.roomName || '',
        durationMin: Number(step.duration_min || step.durationMin || 15),
        focus: step.focus || ''
      }));
    }

    /**
     * Validación orientada a objetos (Polimorfismo)
     */
    validate() {
      super.validate();
      if (!this.title || this.title.trim().length === 0) {
        throw new Error('[Tour] El título del tour temático es obligatorio.');
      }
      if (!this.guide || this.guide.trim().length === 0) {
        throw new Error('[Tour] El guía o especialista a cargo es obligatorio.');
      }
      if (isNaN(this.maxCapacity) || this.maxCapacity < 1) {
        throw new Error('[Tour] El aforo máximo debe ser mayor a 0.');
      }
      if (this.registeredAttendees > this.maxCapacity) {
        throw new Error('[Tour] Los asistentes registrados no pueden superar el aforo máximo.');
      }
      return true;
    }

    /**
     * Insignia representativa de la tarjeta UI (Frontend)
     */
    getDisplayBadge() {
      const remaining = this.maxCapacity - this.registeredAttendees;
      if (remaining <= 0) {
        return { text: 'Aforo Completo', cssClass: 'badge-danger' };
      } else if (remaining <= 5) {
        return { text: `Últimos ${remaining} cupos`, cssClass: 'badge-amber' };
      } else {
        return { text: 'Inscripciones Abiertas', cssClass: 'badge-green' };
      }
    }

    /**
     * Resumen textual para frontend
     */
    formatSummary() {
      return `Tour: "${this.title}" (${this.dateTime}) · Guía: ${this.guide}`;
    }

    getSummary() {
      const occupancyPercent = Math.round((this.registeredAttendees / (this.maxCapacity || 1)) * 100);
      return `Tour: "${this.title}" guiado por ${this.guide} [${this.registeredAttendees}/${this.maxCapacity} asistentes (${occupancyPercent}% ocupado), ${this.itinerary.length} paradas]`;
    }

    /**
     * Serialización JSON
     */
    toJSON() {
      return {
        ...super.toJSON(),
        title: this.title,
        guide: this.guide,
        dateTime: this.dateTime,
        duration: this.duration,
        registeredAttendees: this.registeredAttendees,
        maxCapacity: this.maxCapacity,
        language: this.language,
        itinerary: this.itinerary
      };
    }

    /**
     * Mapeo estático desde fila MySQL
     */
    static fromDatabaseRow(tourRow, itineraryRows = []) {
      if (!tourRow) return null;
      return new Tour({
        id: tourRow.id,
        title: tourRow.title,
        guide: tourRow.guide,
        dateTime: tourRow.date_time,
        duration: tourRow.duration,
        registeredAttendees: tourRow.registered_attendees,
        maxCapacity: tourRow.max_capacity,
        language: tourRow.language,
        createdAt: tourRow.created_at
      }, itineraryRows);
    }

    // ============================================================================
    // OPERACIONES DE PERSISTENCIA MYSQL (BACKEND)
    // ============================================================================

    static async findAll() {
      if (!pool) return [];
      const [toursRows] = await pool.query('SELECT * FROM tours ORDER BY LENGTH(id) ASC, id ASC');
      const [itinerariesRows] = await pool.query('SELECT * FROM tour_itineraries ORDER BY tour_id ASC, step_order ASC');

      return toursRows.map(tour => {
        const tourItinerary = itinerariesRows.filter(item => item.tour_id === tour.id);
        return Tour.fromDatabaseRow(tour, tourItinerary);
      });
    }

    static async findById(id) {
      if (!pool) return null;
      const [toursRows] = await pool.query('SELECT * FROM tours WHERE id = ?', [id]);
      if (toursRows.length === 0) return null;

      const [itinerariesRows] = await pool.query('SELECT * FROM tour_itineraries WHERE tour_id = ? ORDER BY step_order ASC', [id]);
      return Tour.fromDatabaseRow(toursRows[0], itinerariesRows);
    }

    static async create(data) {
      if (!pool) return null;
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const id = data.id || (await SequenceHelper.getNextId(pool, 'tours', 'tour'));
        const tourInstance = new Tour({ ...data, id }, data.itinerary);
        tourInstance.validate();

        await connection.query(
          `INSERT INTO tours (id, title, guide, date_time, duration, registered_attendees, max_capacity, language, description, start_date, end_date, web_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            tourInstance.title,
            tourInstance.guide,
            tourInstance.dateTime || 'Por definir',
            tourInstance.duration,
            tourInstance.registeredAttendees,
            tourInstance.maxCapacity,
            tourInstance.language,
            tourInstance.description || null,
            tourInstance.startDate || null,
            tourInstance.endDate || null,
            tourInstance.webUrl || null
          ]
        );

        const itineraryList = tourInstance.itinerary.length > 0
          ? tourInstance.itinerary
          : [
              { step: 1, roomName: 'Sala de Recepción Patrimonial', durationMin: 15, focus: 'Contexto histórico' },
              { step: 2, roomName: 'Galería de Obras Principales', durationMin: 35, focus: 'Análisis técnico de piezas' },
              { step: 3, roomName: 'Cámara de Conservación', durationMin: 10, focus: 'Conclusiones y preguntas' }
            ];

        for (const item of itineraryList) {
          await connection.query(
            `INSERT INTO tour_itineraries (tour_id, step_order, room_name, duration_min, focus)
             VALUES (?, ?, ?, ?, ?)`,
            [id, item.step || 1, item.roomName, item.durationMin || 15, item.focus || '']
          );
        }

        await connection.commit();
        return Tour.findById(id);
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }

    static async registerAttendee(id) {
      if (!pool) return null;
      const tour = await Tour.findById(id);
      if (!tour) {
        const err = new Error('Tour no encontrado');
        err.statusCode = 404;
        throw err;
      }

      if (tour.registeredAttendees >= tour.maxCapacity) {
        const err = new Error('Aforo completo para este tour');
        err.statusCode = 400;
        throw err;
      }

      await pool.query('UPDATE tours SET registered_attendees = registered_attendees + 1 WHERE id = ?', [id]);
      return Tour.findById(id);
    }

    static async update(id, data) {
      if (!pool) return null;
      const existing = await Tour.findById(id);
      if (!existing) return null;

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const updatedInstance = new Tour({
          ...existing,
          ...data,
          id
        }, data.itinerary || existing.itinerary);
        updatedInstance.validate();

        await connection.query(
          `UPDATE tours
           SET title = ?, guide = ?, date_time = ?, duration = ?, registered_attendees = ?, max_capacity = ?, language = ?, description = ?, start_date = ?, end_date = ?, web_url = ?
           WHERE id = ?`,
          [
            updatedInstance.title,
            updatedInstance.guide,
            updatedInstance.dateTime,
            updatedInstance.duration,
            updatedInstance.registeredAttendees,
            updatedInstance.maxCapacity,
            updatedInstance.language,
            updatedInstance.description || null,
            updatedInstance.startDate || null,
            updatedInstance.endDate || null,
            updatedInstance.webUrl || null,
            id
          ]
        );

        if (Array.isArray(data.itinerary) && data.itinerary.length > 0) {
          await connection.query('DELETE FROM tour_itineraries WHERE tour_id = ?', [id]);
          for (const item of data.itinerary) {
            await connection.query(
              `INSERT INTO tour_itineraries (tour_id, step_order, room_name, duration_min, focus)
               VALUES (?, ?, ?, ?, ?)`,
              [id, item.step || item.step_order || 1, item.roomName || item.room_name, item.durationMin || item.duration_min || 15, item.focus || '']
            );
          }
        }

        await connection.commit();
        return Tour.findById(id);
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }
  }

  // Exportación frontend
  if (typeof window !== 'undefined') {
    window.Tour = Tour;
    window.TourModel = Tour;
  }

  // Exportación backend
  if (isNode) {
    module.exports = Tour;
  }
})();
