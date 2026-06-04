const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, servicioController.obtenerServicios);
router.get('/ventanillas', authMiddleware, servicioController.obtenerVentanillas);

module.exports = router;