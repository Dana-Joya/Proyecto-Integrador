/**
 * ==============================================================================
 * CLASE HELPER: SequenceHelper (POO)
 * Genera identificadores secuenciales correlativos (ej: mus-5, art-7, tour-4, room-6)
 * evitando marcas de tiempo desordenadas.
 * ==============================================================================
 */

class SequenceHelper {
  /**
   * Obtiene el siguiente identificador correlativo para una tabla y prefijo dados.
   * @param {Object} pool - Pool de conexiones MySQL
   * @param {string} table - Nombre de la tabla
   * @param {string} prefix - Prefijo del identificador (ej: 'mus', 'art', 'room', 'tour')
   * @returns {Promise<string>} Siguiente ID secuencial
   */
  static async getNextId(pool, table, prefix) {
    try {
      const [rows] = await pool.query(`SELECT id FROM ${table} WHERE id LIKE ?`, [`${prefix}-%`]);
      let maxNum = 0;

      for (const row of rows) {
        const match = row.id.match(new RegExp(`^${prefix}-(\\d+)$`));
        if (match) {
          const num = parseInt(match[1], 10);
          // Ignoramos timestamps gigantes de pruebas anteriores (> 100000)
          if (num < 100000 && num > maxNum) {
            maxNum = num;
          }
        }
      }

      return `${prefix}-${maxNum + 1}`;
    } catch (error) {
      console.warn(`[SequenceHelper] Error al calcular correlativo para ${table}:`, error.message);
      return `${prefix}-${Date.now()}`;
    }
  }
}

module.exports = SequenceHelper;

