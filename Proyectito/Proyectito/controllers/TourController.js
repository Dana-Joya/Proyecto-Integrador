/**
 * ==============================================================================
 * CONTROLADOR: TourController (POO - HERENCIA DE BaseController)
 * ==============================================================================
 */

const BaseController = require('./BaseController');
const Tour = require('../models/Tour');

class TourController extends BaseController {
  static async getAll(req, res) {
    try {
      const tours = await Tour.findAll();
      return BaseController.sendSuccess(res, tours);
    } catch (error) {
      return BaseController.handleError(res, error, 'TourController.getAll');
    }
  }

  static async getById(req, res) {
    try {
      const tour = await Tour.findById(req.params.id);
      if (!tour) {
        return BaseController.sendNotFound(res, 'Tour');
      }
      return BaseController.sendSuccess(res, tour);
    } catch (error) {
      return BaseController.handleError(res, error, 'TourController.getById');
    }
  }

  static async create(req, res) {
    try {
      if (!req.body.title || !req.body.guide) {
        return BaseController.sendBadRequest(res, 'Título y guía son campos obligatorios');
      }
      const newTour = await Tour.create(req.body);
      return BaseController.sendSuccess(res, newTour, 201);
    } catch (error) {
      return BaseController.handleError(res, error, 'TourController.create');
    }
  }

  static async register(req, res) {
    try {
      const { id } = req.params;
      const updatedTour = await Tour.registerAttendee(id);
      return BaseController.sendSuccess(res, updatedTour);
    } catch (error) {
      return BaseController.handleError(res, error, 'TourController.register');
    }
  }

  static async update(req, res) {
    try {
      const updated = await Tour.update(req.params.id, req.body);
      if (!updated) {
        return BaseController.sendNotFound(res, 'Tour');
      }
      return BaseController.sendSuccess(res, updated);
    } catch (error) {
      return BaseController.handleError(res, error, 'TourController.update');
    }
  }
}

module.exports = TourController;
