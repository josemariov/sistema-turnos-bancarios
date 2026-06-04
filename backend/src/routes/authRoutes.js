const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.put('/perfil', authMiddleware, authController.actualizarPerfil);

module.exports = router;