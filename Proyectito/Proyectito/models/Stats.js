/**
 * ==============================================================================
 * MODELO: Stats (POO)
 * Calcula y consolida las métricas del Dashboard directamente en MySQL.
 * ==============================================================================
 */

const { pool } = require('../db');

class Stats {
  /**
   * Obtiene las métricas consolidadas del sistema
   */
  static async getDashboardStats() {
    const [[{ totalMuseums }]] = await pool.query('SELECT COUNT(*) AS totalMuseums FROM museums');
    const [[{ totalArtworks, avgConservation }]] = await pool.query(
      'SELECT COUNT(*) AS totalArtworks, COALESCE(AVG(conservation_percent), 94.2) AS avgConservation FROM artworks'
    );
    const [[{ activeRooms }]] = await pool.query('SELECT COUNT(*) AS activeRooms FROM rooms');
    const [[{ weeklyTours }]] = await pool.query('SELECT COUNT(*) AS weeklyTours FROM tours');

    return {
      totalMuseums: Number(totalMuseums),
      totalArtworks: Number(totalArtworks),
      activeRooms: Number(activeRooms),
      weeklyTours: Number(weeklyTours),
      avgConservation: parseFloat(Number(avgConservation).toFixed(1))
    };
  }
}

module.exports = Stats;

