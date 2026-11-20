/**
 * ==============================================================================
 * CONTROLADOR: StatsController (POO - HERENCIA DE BaseController)
 * ==============================================================================
 */

const BaseController = require('./BaseController');
const Stats = require('../models/Stats');

class StatsController extends BaseController {
  static async getStats(req, res) {
    try {
      const stats = await Stats.getDashboardStats();
      return BaseController.sendSuccess(res, stats);
    } catch (error) {
      return BaseController.handleError(res, error, 'StatsController.getStats');
    }
  }
}

module.exports = StatsController;
