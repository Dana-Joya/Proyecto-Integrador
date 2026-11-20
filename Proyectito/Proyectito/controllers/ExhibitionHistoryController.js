const BaseController = require('./BaseController');
const ExhibitionHistory = require('../models/ExhibitionHistory');

class ExhibitionHistoryController extends BaseController {
  static async getAll(req, res) {
    try {
      return BaseController.sendSuccess(res, await ExhibitionHistory.findAll());
    } catch (error) {
      return BaseController.handleError(res, error, 'ExhibitionHistoryController.getAll');
    }
  }

  static async create(req, res) {
    try {
      const item = await ExhibitionHistory.create(req.body);
      return BaseController.sendSuccess(res, item, 201);
    } catch (error) {
      return BaseController.handleError(res, error, 'ExhibitionHistoryController.create');
    }
  }

  static async close(req, res) {
    try {
      const item = await ExhibitionHistory.closePeriod(req.params.id, req.body.end_date);
      if (!item) return BaseController.sendNotFound(res, 'Registro de exposición');
      return BaseController.sendSuccess(res, item);
    } catch (error) {
      return BaseController.handleError(res, error, 'ExhibitionHistoryController.close');
    }
  }
}

module.exports = ExhibitionHistoryController;
