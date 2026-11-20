/**
 * ==============================================================================
 * CONTROLADOR: MuseumController (POO - HERENCIA DE BaseController)
 * ==============================================================================
 */

const BaseController = require('./BaseController');
const Museum = require('../models/Museum');

class MuseumController extends BaseController {
  static async getAll(req, res) {
    try {
      const museums = await Museum.findAll();
      return BaseController.sendSuccess(res, museums);
    } catch (error) {
      return BaseController.handleError(res, error, 'MuseumController.getAll');
    }
  }

  static async getById(req, res) {
    try {
      const museum = await Museum.findById(req.params.id);
      if (!museum) {
        return BaseController.sendNotFound(res, 'Museo');
      }
      return BaseController.sendSuccess(res, museum);
    } catch (error) {
      return BaseController.handleError(res, error, 'MuseumController.getById');
    }
  }

  static async create(req, res) {
    try {
      if (!req.body.name) {
        return BaseController.sendBadRequest(res, 'El nombre del museo es obligatorio');
      }
      const newMuseum = await Museum.create(req.body);
      return BaseController.sendSuccess(res, newMuseum, 201);
    } catch (error) {
      return BaseController.handleError(res, error, 'MuseumController.create');
    }
  }

  static async update(req, res) {
    try {
      const updated = await Museum.update(req.params.id, req.body);
      if (!updated) {
        return BaseController.sendNotFound(res, 'Museo');
      }
      return BaseController.sendSuccess(res, updated);
    } catch (error) {
      return BaseController.handleError(res, error, 'MuseumController.update');
    }
  }
}

module.exports = MuseumController;
