const db = require('../config/db');

const verTodos = async (req, res) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado, se requiere rol admin' });
    }

    try {
        const [turnos] = await db.query(
            `SELECT t.*, u.nombre, u.email, s.nombre as servicio_nombre
             FROM turnos t 
             JOIN usuarios u ON t.usuario_id = u.id
             LEFT JOIN servicios s ON t.servicio_id = s.id
             ORDER BY t.numero_turno ASC`
        );

        res.json({ turnos });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const actualizarEstado = async (req, res) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado, se requiere rol admin' });
    }

    const { id } = req.params;
    const { estado, ventanilla_id } = req.body;

    const estadosValidos = ['pendiente', 'en_atencion', 'atendido', 'cancelado'];

    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    try {
        const [turno] = await db.query(
            'SELECT * FROM turnos WHERE id = ?', [id]
        );

        if (turno.length === 0) {
            return res.status(404).json({ mensaje: 'Turno no encontrado' });
        }

        await db.query(
            'UPDATE turnos SET estado = ? WHERE id = ?',
            [estado, id]
        );

        if (estado === 'en_atencion' && ventanilla_id) {
            await db.query(
                'UPDATE ventanillas SET estado = ? WHERE id = ?',
                ['ocupada', ventanilla_id]
            );
            await db.query(
                'UPDATE turnos SET ventanilla_id = ? WHERE id = ?',
                [ventanilla_id, id]
            );
        }

        if (estado === 'atendido' || estado === 'cancelado') {
            const [turnoActual] = await db.query(
                'SELECT ventanilla_id FROM turnos WHERE id = ?', [id]
            );
            if (turnoActual[0].ventanilla_id) {
                await db.query(
                    'UPDATE ventanillas SET estado = ? WHERE id = ?',
                    ['disponible', turnoActual[0].ventanilla_id]
                );
            }
        }

        res.json({ mensaje: 'Estado actualizado exitosamente' });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const verFila = async (req, res) => {
    try {
        const [fila] = await db.query(
            `SELECT t.*, u.nombre, u.email, s.nombre as servicio_nombre
             FROM turnos t 
             JOIN usuarios u ON t.usuario_id = u.id 
             LEFT JOIN servicios s ON t.servicio_id = s.id
             WHERE t.estado = 'pendiente'
             ORDER BY t.numero_turno ASC`
        );

        const [estadisticas] = await db.query(
            `SELECT 
                COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
                COUNT(CASE WHEN estado = 'en_atencion' THEN 1 END) as en_atencion,
                COUNT(CASE WHEN estado = 'atendido' THEN 1 END) as atendidos,
                COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as cancelados
             FROM turnos`
        );

        res.json({
            fila,
            estadisticas: estadisticas[0]
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const obtenerEstadisticas = async (req, res) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    try {
        const [porServicio] = await db.query(
            `SELECT s.nombre as servicio, s.prefijo,
                COUNT(*) as total,
                COUNT(CASE WHEN t.estado = 'atendido' THEN 1 END) as atendidos,
                COUNT(CASE WHEN t.estado = 'pendiente' THEN 1 END) as pendientes,
                COUNT(CASE WHEN t.estado = 'cancelado' THEN 1 END) as cancelados,
                AVG(CASE WHEN t.estado = 'atendido' THEN s.tiempo_estimado END) as tiempo_promedio
             FROM turnos t
             JOIN servicios s ON t.servicio_id = s.id
             GROUP BY s.id, s.nombre, s.prefijo`
        );

        const [porHora] = await db.query(
            `SELECT HOUR(created_at) as hora, COUNT(*) as total
             FROM turnos
             WHERE DATE(created_at) = CURDATE()
             GROUP BY HOUR(created_at)
             ORDER BY hora ASC`
        );

        const [resumen] = await db.query(
            `SELECT 
                COUNT(*) as total_hoy,
                COUNT(CASE WHEN estado = 'atendido' THEN 1 END) as atendidos_hoy,
                COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as cancelados_hoy,
                COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes_hoy
             FROM turnos
             WHERE DATE(created_at) = CURDATE()`
        );

        res.json({ porServicio, porHora, resumen: resumen[0] });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const obtenerCajeros = async (req, res) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    try {
        const [cajeros] = await db.query(
            `SELECT u.id, u.nombre, u.email, u.cedula, u.telefono,
                v.id as ventanilla_id, v.numero as ventanilla_numero,
                v.estado as ventanilla_estado, s.nombre as servicio_nombre
             FROM usuarios u
             LEFT JOIN ventanillas v ON v.cajero_id = u.id
             LEFT JOIN servicios s ON v.servicio_id = s.id
             WHERE u.rol = 'cajero'
             ORDER BY u.nombre ASC`
        );

        res.json({ cajeros });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const crearCajero = async (req, res) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    const { nombre, email, password, cedula, telefono, ventanilla_id } = req.body;

    if (!nombre || !email || !password || !cedula || !telefono) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    try {
        const bcrypt = require('bcryptjs');

        const [emailExistente] = await db.query(
            'SELECT * FROM usuarios WHERE email = ?', [email]
        );
        if (emailExistente.length > 0) {
            return res.status(400).json({ mensaje: 'El email ya está registrado' });
        }

        const [cedulaExistente] = await db.query(
            'SELECT * FROM usuarios WHERE cedula = ?', [cedula]
        );
        if (cedulaExistente.length > 0) {
            return res.status(400).json({ mensaje: 'La cédula ya está registrada' });
        }

        const passwordEncriptada = await bcrypt.hash(password, 10);

        const [resultado] = await db.query(
            'INSERT INTO usuarios (nombre, email, password, rol, cedula, telefono) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, email, passwordEncriptada, 'cajero', cedula, telefono]
        );

        if (ventanilla_id) {
            await db.query(
                'UPDATE ventanillas SET cajero_id = ?, estado = ? WHERE id = ?',
                [resultado.insertId, 'disponible', ventanilla_id]
            );
        }

        res.status(201).json({ mensaje: 'Cajero creado exitosamente' });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const toggleVentanilla = async (req, res) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    const { id } = req.params;

    try {
        const [ventanilla] = await db.query(
            'SELECT * FROM ventanillas WHERE id = ?', [id]
        );

        if (ventanilla.length === 0) {
            return res.status(404).json({ mensaje: 'Ventanilla no encontrada' });
        }

        if (!ventanilla[0].cajero_id) {
            return res.status(400).json({ mensaje: 'No puedes abrir una ventanilla sin cajero asignado' });
        }

        const nuevoEstado = ventanilla[0].estado === 'cerrada' ? 'disponible' : 'cerrada';

        await db.query(
            'UPDATE ventanillas SET estado = ? WHERE id = ?',
            [nuevoEstado, id]
        );

        res.json({ mensaje: `Ventanilla ${nuevoEstado === 'disponible' ? 'abierta' : 'cerrada'} exitosamente` });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

module.exports = { verTodos, actualizarEstado, verFila, obtenerEstadisticas, obtenerCajeros, crearCajero, toggleVentanilla };