/**
 * ==============================================================================
 * ENRUTADOR: ApiRoutes (MVC)
 * Vincula cada endpoint REST con su respectivo controlador POO.
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();

const HealthController = require('../controllers/HealthController');
const StatsController = require('../controllers/StatsController');
const MuseumController = require('../controllers/MuseumController');
const ArtworkController = require('../controllers/ArtworkController');
const RoomController = require('../controllers/RoomController');
const ArtistController = require('../controllers/ArtistController');
const TourController = require('../controllers/TourController');
const CategoryController = require('../controllers/CategoryController');
const ExhibitionHistoryController = require('../controllers/ExhibitionHistoryController');

// 1. Health check
router.get('/health', HealthController.check);

// 2. Estadísticas Dashboard
router.get('/stats', StatsController.getStats);

// 3. Museos
router.get('/museos', MuseumController.getAll);
router.get('/museos/:id', MuseumController.getById);
router.post('/museos', MuseumController.create);
router.put('/museos/:id', MuseumController.update);

// 4. Obras de Arte / Artifacts
router.get('/obras', ArtworkController.getAll);
router.get('/obras/:id', ArtworkController.getById);
router.post('/obras', ArtworkController.create);
router.put('/obras/:id', ArtworkController.update);
router.put('/obras/:id/conservation', ArtworkController.updateConservation);
router.get('/artifacts', ArtworkController.getAll);
router.get('/artifacts/:id', ArtworkController.getById);
router.post('/artifacts', ArtworkController.create);
router.put('/artifacts/:id', ArtworkController.update);

// Categorías
router.get('/categorias', CategoryController.getAll);
router.get('/categorias/:id', CategoryController.getById);
router.post('/categorias', CategoryController.create);

// 5. Salas de Exposición
router.get('/salas', RoomController.getAll);
router.get('/salas/:id', RoomController.getById);
router.post('/salas', RoomController.create);
router.put('/salas/:id', RoomController.update);

// 6. Artistas
router.get('/artistas', ArtistController.getAll);
router.get('/artistas/:id', ArtistController.getById);
router.post('/artistas', ArtistController.create);
router.put('/artistas/:id', ArtistController.update);

// 7. Historial de exposición de objetos
router.get('/historial-exposicion', ExhibitionHistoryController.getAll);
router.post('/historial-exposicion', ExhibitionHistoryController.create);
router.put('/historial-exposicion/:id/cerrar', ExhibitionHistoryController.close);

// 8. Visitas Guiadas (Tours)
router.get('/tours', TourController.getAll);
router.get('/tours/:id', TourController.getById);
router.post('/tours', TourController.create);
router.put('/tours/:id', TourController.update);
router.post('/tours/:id/register', TourController.register);

module.exports = router;

