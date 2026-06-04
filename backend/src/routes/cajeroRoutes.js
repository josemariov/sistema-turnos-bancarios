const express = require('express');
const router = express.Router();
const cajeroController = require('../controllers/cajeroController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/ventanilla', authMiddleware, cajeroController.miVentanilla);
router.get('/fila', authMiddleware, cajeroController.misFila);
router.post('/llamar', authMiddleware, cajeroController.llamarSiguiente);
router.put('/finalizar', authMiddleware, cajeroController.finalizarTurno);

module.exports = router;