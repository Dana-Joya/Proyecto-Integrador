/**
 * ==============================================================================
 * PATRIMONIA - SERVIDOR BACKEND (ARQUITECTURA MVC + POO)
 * Clase Server encargada de inicializar middlewares, enrutamiento y conexión MySQL.
 * ==============================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./db');
const apiRoutes = require('./routes/apiRoutes');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.configureMiddlewares();
    this.configureRoutes();
  }

  /**
   * Configuración de middlewares globales
   */
  configureMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '15mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '15mb' }));
    
    // Servir archivos estáticos del frontend (HTML, CSS, JS)
    this.app.use(express.static(path.join(__dirname)));
  }

  /**
   * Montaje de rutas de la API y soporte para SPA
   */
  configureRoutes() {
    // Rutas modulares REST
    this.app.use('/api', apiRoutes);

    // Comodín para SPA
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });
  }

  /**
   * Inicialización del servidor HTTP y prueba de conexión a MySQL
   */
  async start() {
    this.serverInstance = this.app.listen(this.port, async () => {
      console.log('================================================================');
      console.log(`🚀 Servidor PATRIMONIA (Arquitectura MVC + POO) en http://localhost:${this.port}`);
      console.log(`📡 Endpoints API disponibles en http://localhost:${this.port}/api/`);
      console.log('================================================================');
      await testConnection();
    });
  }
}

// Instanciar y ejecutar
const server = new Server();
server.start();

module.exports = server;
