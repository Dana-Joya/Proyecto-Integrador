/**
 * ==============================================================================
 * CONTROLADOR: CategoryController (POO - HERENCIA DE BaseController)
 * ==============================================================================
 */

const BaseController = require('./BaseController');
const Category = require('../models/Category');

class CategoryController extends BaseController {
  static async getAll(req, res) {
    try {
      const categories = await Category.findAll();
      return BaseController.sendSuccess(res, categories);
    } catch (error) {
      return BaseController.handleError(res, error, 'CategoryController.getAll');
    }
  }

  static async getById(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return BaseController.sendNotFound(res, 'Categoría');
      }
      return BaseController.sendSuccess(res, category);
    } catch (error) {
      return BaseController.handleError(res, error, 'CategoryController.getById');
    }
  }

  static async create(req, res) {
    try {
      if (!req.body.name) {
        return BaseController.sendBadRequest(res, 'El nombre de la categoría es obligatorio');
      }
      const newCategory = await Category.create(req.body);
      return BaseController.sendSuccess(res, newCategory, 201);
    } catch (error) {
      return BaseController.handleError(res, error, 'CategoryController.create');
    }
  }
}

module.exports = CategoryController;

