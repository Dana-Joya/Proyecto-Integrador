/**
 * ==============================================================================
 * CONTROLADOR: RoomController (POO - HERENCIA DE BaseController)
 * ==============================================================================
 */

const BaseController = require('./BaseController');
const Room = require('../models/Room');

class RoomController extends BaseController {
  static async getAll(req, res) {
    try {
      const rooms = await Room.findAll();
      return BaseController.sendSuccess(res, rooms);
    } catch (error) {
      return BaseController.handleError(res, error, 'RoomController.getAll');
    }
  }

  static async getById(req, res) {
    try {
      const room = await Room.findById(req.params.id);
      if (!room) {
        return BaseController.sendNotFound(res, 'Sala');
      }
      return BaseController.sendSuccess(res, room);
    } catch (error) {
      return BaseController.handleError(res, error, 'RoomController.getById');
    }
  }

  static async create(req, res) {
    try {
      if (!req.body.name) {
        return BaseController.sendBadRequest(res, 'El nombre de la sala es obligatorio');
      }
      const newRoom = await Room.create(req.body);
      return BaseController.sendSuccess(res, newRoom, 201);
    } catch (error) {
      return BaseController.handleError(res, error, 'RoomController.create');
    }
  }

  static async update(req, res) {
    try {
      const updated = await Room.update(req.params.id, req.body);
      if (!updated) {
        return BaseController.sendNotFound(res, 'Sala');
      }
      return BaseController.sendSuccess(res, updated);
    } catch (error) {
      return BaseController.handleError(res, error, 'RoomController.update');
    }
  }
}

module.exports = RoomController;
