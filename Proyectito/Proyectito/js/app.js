/**
 * ==============================================================================
 * SISTEMA DE ADMINISTRACIÓN DE MUSEOS - PUNTO DE ENTRADA MVC (POO)
 * Reemplaza la lógica anterior por una arquitectura orientada a objetos (POO).
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialización del controlador maestro MVC
  window.appController = new AppController();
  window.App = window.appController;
  window.appController.init();
});
