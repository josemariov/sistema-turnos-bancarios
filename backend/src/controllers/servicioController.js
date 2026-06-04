const db = require('../config/db');

const obtenerServicios = async (req, res) => {
    try {
        const [servicios] = await db.query(
            'SELECT * FROM servicios WHERE activo = true'
        );
        res.json({ servicios });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const obtenerVentanillas = async (req, res) => {
    try {
        const [ventanillas] = await db.query(
            `SELECT v.*, s.nombre as servicio_nombre 
             FROM ventanillas v 
             JOIN servicios s ON v.servicio_id = s.id
             ORDER BY v.numero ASC`
        );
        res.json({ ventanillas });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

module.exports = { obtenerServicios, obtenerVentanillas };