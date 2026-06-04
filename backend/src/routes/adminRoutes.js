const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/turnos', authMiddleware, adminController.verTodos);
router.put('/turnos/:id/estado', authMiddleware, adminController.actualizarEstado);
router.get('/fila', adminController.verFila);
router.get('/estadisticas', authMiddleware, adminController.obtenerEstadisticas);
router.get('/cajeros', authMiddleware, adminController.obtenerCajeros);
router.post('/cajeros', authMiddleware, adminController.crearCajero);
router.put('/ventanillas/:id/toggle', authMiddleware, adminController.toggleVentanilla);

module.exports = router;