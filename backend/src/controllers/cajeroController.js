/**
 * @module cajeroController
 * @description Controlador del modulo de cajero bancario
 * Gestiona ventanilla asignada, llamado y finalizacion de turnos
 * @author Jose Mario Viloria Barreto
 * @version 1.0.0
 */

const db = require('../config/db');

const miVentanilla = async (req, res) => {
    const cajeroId = req.usuario.id;

    try {
        const [ventanilla] = await db.query(
            `SELECT v.*, s.nombre as servicio_nombre, s.prefijo
             FROM ventanillas v
             JOIN servicios s ON v.servicio_id = s.id
             WHERE v.cajero_id = ?`,
            [cajeroId]
        );

        if (ventanilla.length === 0) {
            return res.status(404).json({ mensaje: 'No tienes una ventanilla asignada' });
        }

        res.json({ ventanilla: ventanilla[0] });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const misFila = async (req, res) => {
    const cajeroId = req.usuario.id;

    try {
        const [ventanilla] = await db.query(
            'SELECT * FROM ventanillas WHERE cajero_id = ?',
            [cajeroId]
        );

        if (ventanilla.length === 0) {
            return res.status(404).json({ mensaje: 'No tienes una ventanilla asignada' });
        }

        const [turnos] = await db.query(
            `SELECT t.*, u.nombre, u.email, s.nombre as servicio_nombre, s.prefijo
             FROM turnos t
             JOIN usuarios u ON t.usuario_id = u.id
             JOIN servicios s ON t.servicio_id = s.id
             WHERE t.servicio_id = ? AND t.estado = 'pendiente'
             ORDER BY t.numero_turno ASC`,
            [ventanilla[0].servicio_id]
        );

        const [estadisticas] = await db.query(
            `SELECT 
                COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
                COUNT(CASE WHEN estado = 'en_atencion' THEN 1 END) as en_atencion,
                COUNT(CASE WHEN estado = 'atendido' THEN 1 END) as atendidos
             FROM turnos
             WHERE servicio_id = ? AND DATE(created_at) = CURDATE()`,
            [ventanilla[0].servicio_id]
        );

        res.json({
            ventanilla: ventanilla[0],
            turnos,
            estadisticas: estadisticas[0]
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const llamarSiguiente = async (req, res) => {
    const cajeroId = req.usuario.id;

    try {
        const [ventanilla] = await db.query(
            'SELECT * FROM ventanillas WHERE cajero_id = ?',
            [cajeroId]
        );

        if (ventanilla.length === 0) {
            return res.status(404).json({ mensaje: 'No tienes una ventanilla asignada' });
        }

        const [turnoEnAtencion] = await db.query(
            `SELECT * FROM turnos 
             WHERE ventanilla_id = ? AND estado = 'en_atencion'`,
            [ventanilla[0].id]
        );

        if (turnoEnAtencion.length > 0) {
            return res.status(400).json({ 
                mensaje: 'Ya tienes un turno en atención, debes finalizarlo primero',
                turno: turnoEnAtencion[0]
            });
        }

        const [siguienteTurno] = await db.query(
            `SELECT t.*, u.nombre, u.email, s.nombre as servicio_nombre
             FROM turnos t
             JOIN usuarios u ON t.usuario_id = u.id
             JOIN servicios s ON t.servicio_id = s.id
             WHERE t.servicio_id = ? AND t.estado = 'pendiente'
             ORDER BY t.numero_turno ASC LIMIT 1`,
            [ventanilla[0].servicio_id]
        );

        if (siguienteTurno.length === 0) {
            return res.status(404).json({ mensaje: 'No hay turnos pendientes en tu servicio' });
        }

        await db.query(
            'UPDATE turnos SET estado = ?, ventanilla_id = ? WHERE id = ?',
            ['en_atencion', ventanilla[0].id, siguienteTurno[0].id]
        );

        await db.query(
            'UPDATE ventanillas SET estado = ? WHERE id = ?',
            ['ocupada', ventanilla[0].id]
        );

        res.json({
            mensaje: 'Siguiente turno llamado',
            turno: siguienteTurno[0],
            ventanilla: ventanilla[0]
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const finalizarTurno = async (req, res) => {
    const cajeroId = req.usuario.id;

    try {
        const [ventanilla] = await db.query(
            'SELECT * FROM ventanillas WHERE cajero_id = ?',
            [cajeroId]
        );

        if (ventanilla.length === 0) {
            return res.status(404).json({ mensaje: 'No tienes una ventanilla asignada' });
        }

        const [turnoEnAtencion] = await db.query(
            `SELECT * FROM turnos 
             WHERE ventanilla_id = ? AND estado = 'en_atencion'`,
            [ventanilla[0].id]
        );

        if (turnoEnAtencion.length === 0) {
            return res.status(404).json({ mensaje: 'No tienes un turno en atención' });
        }

        await db.query(
            'UPDATE turnos SET estado = ? WHERE id = ?',
            ['atendido', turnoEnAtencion[0].id]
        );

        await db.query(
            'UPDATE ventanillas SET estado = ? WHERE id = ?',
            ['disponible', ventanilla[0].id]
        );

        res.json({ mensaje: 'Turno finalizado exitosamente' });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

module.exports = { miVentanilla, misFila, llamarSiguiente, finalizarTurno };