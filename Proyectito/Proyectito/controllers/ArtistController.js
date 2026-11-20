/**
 * ==============================================================================
 * CONTROLADOR: ArtistController (POO - HERENCIA DE BaseController)
 * ==============================================================================
 */

const BaseController = require('./BaseController');
const Artist = require('../models/Artist');

class ArtistController extends BaseController {
  static async getAll(req, res) {
    try {
      const artists = await Artist.findAll();
      return BaseController.sendSuccess(res, artists);
    } catch (error) {
      return BaseController.handleError(res, error, 'ArtistController.getAll');
    }
  }

  static async getById(req, res) {
    try {
      const artist = await Artist.findById(req.params.id);
      if (!artist) {
        return BaseController.sendNotFound(res, 'Artista');
      }
      return BaseController.sendSuccess(res, artist);
    } catch (error) {
      return BaseController.handleError(res, error, 'ArtistController.getById');
    }
  }

  static async create(req, res) {
    try {
      if (!req.body.name) {
        return BaseController.sendBadRequest(res, 'El nombre del artista es obligatorio');
      }
      const newArtist = await Artist.create(req.body);
      return BaseController.sendSuccess(res, newArtist, 201);
    } catch (error) {
      return BaseController.handleError(res, error, 'ArtistController.create');
    }
  }

  static async update(req, res) {
    try {
      const updated = await Artist.update(req.params.id, req.body);
      if (!updated) {
        return BaseController.sendNotFound(res, 'Artista');
      }
      return BaseController.sendSuccess(res, updated);
    } catch (error) {
      return BaseController.handleError(res, error, 'ArtistController.update');
    }
  }
}

module.exports = ArtistController;
