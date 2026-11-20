/**
 * ==============================================================================
 * CONTROLADOR: HealthController (POO - HERENCIA DE BaseController)
 * Maneja las comprobaciones de salud del backend y la conectividad a MySQL.
 * ==============================================================================
 */

const BaseController = require('./BaseController');
const { pool, dbConfig, testConnection } = require('../db');

class HealthController extends BaseController {
  static async check(req, res) {
    try {
      await pool.query('SELECT 1');
      const [tableRows] = await pool.query("SHOW TABLES LIKE 'artworks'");
      const tablesReady = tableRows.length > 0;

      return BaseController.sendSuccess(res, {
        status: 'UP',
        database: 'CONNECTED',
        tablesReady,
        server: 'Node.js Express (MVC POO)',
        dbName: dbConfig.database,
        host: dbConfig.host,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(503).json({
        status: 'DOWN',
        database: 'DISCONNECTED',
        error: error.message,
        help: 'Asegúrate de que el módulo MySQL esté iniciado en XAMPP (puerto 3306).',
        timestamp: new Date().toISOString()
      });
    }
  }

  static async retryProvision(req, res) {
    try {
      const ok = await testConnection();
      if (ok) {
        return BaseController.sendSuccess(res, { message: 'Base de datos aprovisionada y conectada.' });
      }
      return res.status(503).json({ error: 'No se pudo conectar a MySQL.' });
    } catch (error) {
      return BaseController.handleError(res, error, 'HealthController.retryProvision');
    }
  }
}

module.exports = HealthController;
