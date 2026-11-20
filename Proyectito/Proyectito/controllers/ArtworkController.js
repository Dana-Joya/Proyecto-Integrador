/**
 * ==============================================================================
 * CONTROLADOR: ArtworkController (POO - HERENCIA DE BaseController)
 * ==============================================================================
 */

const BaseController = require('./BaseController');
const Artwork = require('../models/Artwork');

class ArtworkController extends BaseController {
  static async getAll(req, res) {
    try {
      const artworks = await Artwork.findAll();
      return BaseController.sendSuccess(res, artworks);
    } catch (error) {
      return BaseController.handleError(res, error, 'ArtworkController.getAll');
    }
  }

  static async getById(req, res) {
    try {
      const artwork = await Artwork.findById(req.params.id);
      if (!artwork) {
        return BaseController.sendNotFound(res, 'Obra');
      }
      return BaseController.sendSuccess(res, artwork);
    } catch (error) {
      return BaseController.handleError(res, error, 'ArtworkController.getById');
    }
  }

  static async create(req, res) {
    try {
      if (!req.body.title || !req.body.artist) {
        return BaseController.sendBadRequest(res, 'Título y artista son campos obligatorios');
      }
      const newArtwork = await Artwork.create(req.body);
      return BaseController.sendSuccess(res, newArtwork, 201);
    } catch (error) {
      return BaseController.handleError(res, error, 'ArtworkController.create');
    }
  }

  static async updateConservation(req, res) {
    try {
      const { id } = req.params;
      const percent = parseInt(req.body.conservationPercent ?? req.body.percent, 10);

      if (isNaN(percent) || percent < 1 || percent > 100) {
        return BaseController.sendBadRequest(res, 'El porcentaje debe ser un entero entre 1 y 100');
      }

      const updatedArtwork = await Artwork.updateConservation(id, percent);
      if (!updatedArtwork) {
        return BaseController.sendNotFound(res, 'Obra');
      }

      return BaseController.sendSuccess(res, updatedArtwork);
    } catch (error) {
      return BaseController.handleError(res, error, 'ArtworkController.updateConservation');
    }
  }

  static async update(req, res) {
    try {
      const updated = await Artwork.update(req.params.id, req.body);
      if (!updated) {
        return BaseController.sendNotFound(res, 'Obra');
      }
      return BaseController.sendSuccess(res, updated);
    } catch (error) {
      return BaseController.handleError(res, error, 'ArtworkController.update');
    }
  }
}

module.exports = ArtworkController;
