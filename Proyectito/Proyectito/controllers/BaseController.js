/**
 * ==============================================================================
 * CLASE BASE: BaseController (POO - HERENCIA Y POLIMORFISMO EN CONTROLADORES)
 * Superclase para los controladores MVC del backend.
 * ==============================================================================
 */

class BaseController {
  /**
   * Respuesta estandarizada de éxito (Polimórfica)
   */
  static sendSuccess(res, data, status = 200) {
    return res.status(status).json(data);
  }

  /**
   * Respuesta estandarizada de recurso no encontrado (404)
   */
  static sendNotFound(res, entityName = 'Recurso') {
    return res.status(404).json({
      error: `${entityName} no encontrado en el sistema patrimonial.`,
      status: 404,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Respuesta de solicitud incorrecta (400)
   */
  static sendBadRequest(res, message = 'Datos de solicitud inválidos.') {
    return res.status(400).json({
      error: message,
      status: 400,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Manejador centralizado y polimórfico de excepciones HTTP (500 / error de BD)
   */
  static handleError(res, error, context = 'Operación') {
    console.error(`[${context}] Error:`, error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      error: error.message || 'Error interno en el servidor de base de datos',
      context,
      code: error.code || 'INTERNAL_ERROR',
      status,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = BaseController;

