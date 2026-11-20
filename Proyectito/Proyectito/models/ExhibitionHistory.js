/**
 * Modelo para el historial de exposición de obras en salas.
 */
const { pool } = require('../db');

class ExhibitionHistory {
  static async createTable(dbConnection = pool) {
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS exhibition_history (
        id INT NOT NULL AUTO_INCREMENT,
        artwork_id VARCHAR(50) NOT NULL,
        room_id VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_exhibition_artwork (artwork_id),
        KEY idx_exhibition_room (room_id),
        CONSTRAINT fk_exhibition_artwork FOREIGN KEY (artwork_id)
          REFERENCES artworks (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_exhibition_room FOREIGN KEY (room_id)
          REFERENCES rooms (id) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  static async findAll() {
    const [rows] = await pool.query(`
      SELECT h.id, h.artwork_id, a.title AS artwork_title,
             h.room_id, r.name AS room_name, h.start_date, h.end_date,
             h.notes
      FROM exhibition_history h
      INNER JOIN artworks a ON a.id = h.artwork_id
      INNER JOIN rooms r ON r.id = h.room_id
      ORDER BY h.start_date DESC, h.id DESC
    `);
    return rows;
  }

  static async create(data) {
    const { artwork_id, room_id, start_date, end_date = null, notes = null } = data;
    if (!artwork_id || !room_id || !start_date) {
      const error = new Error('Obra, sala y fecha de inicio son obligatorias.');
      error.statusCode = 400;
      throw error;
    }
    if (end_date && new Date(end_date) < new Date(start_date)) {
      const error = new Error('La fecha final no puede ser anterior a la fecha inicial.');
      error.statusCode = 400;
      throw error;
    }
    const [result] = await pool.query(
      `INSERT INTO exhibition_history (artwork_id, room_id, start_date, end_date, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [artwork_id, room_id, start_date, end_date || null, notes || null]
    );
    const [rows] = await pool.query('SELECT * FROM exhibition_history WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  static async closePeriod(id, endDate) {
    if (!endDate) {
      const error = new Error('La fecha de finalización es obligatoria.');
      error.statusCode = 400;
      throw error;
    }
    const [result] = await pool.query(
      'UPDATE exhibition_history SET end_date = ? WHERE id = ? AND ? >= start_date',
      [endDate, id, endDate]
    );
    if (!result.affectedRows) return null;
    const [rows] = await pool.query('SELECT * FROM exhibition_history WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = ExhibitionHistory;
