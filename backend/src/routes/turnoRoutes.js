const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/solicitar', authMiddleware, turnoController.solicitarTurno);
router.get('/miturno', authMiddleware, turnoController.miTurno);
router.get('/posicion', authMiddleware, turnoController.posicionEnFila);
router.put('/cancelar', authMiddleware, turnoController.cancelarTurno);
router.get('/historial', authMiddleware, turnoController.historialTurnos);

module.exports = router;