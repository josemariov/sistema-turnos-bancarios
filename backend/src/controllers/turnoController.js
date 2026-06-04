const db = require('../config/db');

const solicitarTurno = async (req, res) => {
    const usuarioId = req.usuario.id;
    const { servicio_id } = req.body;

    if (!servicio_id) {
        return res.status(400).json({ mensaje: 'Debes seleccionar un servicio' });
    }

    try {
        const [turnoExistente] = await db.query(
            'SELECT * FROM turnos WHERE usuario_id = ? AND estado IN (?, ?)',
            [usuarioId, 'pendiente', 'en_atencion']
        );

        if (turnoExistente.length > 0) {
            return res.status(400).json({ 
                mensaje: 'Ya tienes un turno activo',
                turno: turnoExistente[0]
            });
        }

        const [servicio] = await db.query(
            'SELECT * FROM servicios WHERE id = ? AND activo = true',
            [servicio_id]
        );

        if (servicio.length === 0) {
            return res.status(404).json({ mensaje: 'Servicio no encontrado' });
        }

        const [ultimoTurno] = await db.query(
            'SELECT MAX(numero_turno) as ultimo FROM turnos WHERE servicio_id = ?',
            [servicio_id]
        );

        const nuevoNumero = (ultimoTurno[0].ultimo || 0) + 1;
        const codigoTurno = `${servicio[0].prefijo}-${String(nuevoNumero).padStart(3, '0')}`;

        await db.query(
            'INSERT INTO turnos (usuario_id, numero_turno, codigo_turno, servicio_id) VALUES (?, ?, ?, ?)',
            [usuarioId, nuevoNumero, codigoTurno, servicio_id]
        );

        const [turnoCreado] = await db.query(
            `SELECT t.*, s.nombre as servicio_nombre, s.tiempo_estimado, s.prefijo
             FROM turnos t
             JOIN servicios s ON t.servicio_id = s.id
             WHERE t.usuario_id = ? ORDER BY t.created_at DESC LIMIT 1`,
            [usuarioId]
        );

        res.status(201).json({
            mensaje: 'Turno solicitado exitosamente',
            turno: turnoCreado[0]
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const miTurno = async (req, res) => {
    const usuarioId = req.usuario.id;

    try {
        const [turnos] = await db.query(
            `SELECT t.*, s.nombre as servicio_nombre, s.tiempo_estimado, s.prefijo
             FROM turnos t
             LEFT JOIN servicios s ON t.servicio_id = s.id
             WHERE t.usuario_id = ? ORDER BY t.created_at DESC LIMIT 1`,
            [usuarioId]
        );

        if (turnos.length === 0) {
            return res.status(404).json({ mensaje: 'No tienes turnos registrados' });
        }

        res.json({ turno: turnos[0] });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const posicionEnFila = async (req, res) => {
    const usuarioId = req.usuario.id;

    try {
        const [miTurno] = await db.query(
            `SELECT t.*, s.nombre as servicio_nombre, s.tiempo_estimado
             FROM turnos t
             LEFT JOIN servicios s ON t.servicio_id = s.id
             WHERE t.usuario_id = ? AND t.estado = ?`,
            [usuarioId, 'pendiente']
        );

        if (miTurno.length === 0) {
            return res.status(404).json({ mensaje: 'No tienes un turno pendiente' });
        }

        const [posicion] = await db.query(
            'SELECT COUNT(*) as posicion FROM turnos WHERE estado = ? AND servicio_id = ? AND numero_turno <= ?',
            ['pendiente', miTurno[0].servicio_id, miTurno[0].numero_turno]
        );

        const [turnosPendientes] = await db.query(
            'SELECT COUNT(*) as total FROM turnos WHERE estado = ? AND servicio_id = ?',
            ['pendiente', miTurno[0].servicio_id]
        );

        const tiempoEstimado = posicion[0].posicion * (miTurno[0].tiempo_estimado || 10);

        res.json({
            turno: miTurno[0],
            posicion: posicion[0].posicion,
            totalEnFila: turnosPendientes[0].total,
            tiempoEstimado
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const cancelarTurno = async (req, res) => {
    const usuarioId = req.usuario.id;

    try {
        const [turno] = await db.query(
            'SELECT * FROM turnos WHERE usuario_id = ? AND estado = ?',
            [usuarioId, 'pendiente']
        );

        if (turno.length === 0) {
            return res.status(404).json({ mensaje: 'No tienes un turno pendiente para cancelar' });
        }

        await db.query(
            'UPDATE turnos SET estado = ? WHERE id = ?',
            ['cancelado', turno[0].id]
        );

        res.json({ mensaje: 'Turno cancelado exitosamente' });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const historialTurnos = async (req, res) => {
    const usuarioId = req.usuario.id;

    try {
        const [turnos] = await db.query(
            `SELECT t.*, s.nombre as servicio_nombre
             FROM turnos t
             LEFT JOIN servicios s ON t.servicio_id = s.id
             WHERE t.usuario_id = ?
             ORDER BY t.created_at DESC`,
            [usuarioId]
        );

        res.json({ turnos });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

module.exports = { solicitarTurno, miTurno, posicionEnFila, cancelarTurno, historialTurnos };