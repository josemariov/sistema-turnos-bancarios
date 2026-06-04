const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const registro = async (req, res) => {
    const { nombre, email, password, cedula, telefono } = req.body;

    if (!nombre || !email || !password || !cedula || !telefono) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    if (password.length < 8) {
        return res.status(400).json({ mensaje: 'La contraseña debe tener mínimo 8 caracteres' });
    }

    if (!/^\d{7,10}$/.test(cedula)) {
        return res.status(400).json({ mensaje: 'La cédula debe tener entre 7 y 10 dígitos' });
    }

    if (!/^\d{10}$/.test(telefono)) {
        return res.status(400).json({ mensaje: 'El teléfono debe tener 10 dígitos' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ mensaje: 'El email no es válido' });
    }

    try {
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

        await db.query(
            'INSERT INTO usuarios (nombre, email, password, cedula, telefono) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, passwordEncriptada, cedula, telefono]
        );

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    try {
        const [usuarios] = await db.query(
            'SELECT * FROM usuarios WHERE email = ?', [email]
        );

        if (usuarios.length === 0) {
            return res.status(400).json({ mensaje: 'Email o contraseña incorrectos' });
        }

        const usuario = usuarios[0];
        const passwordCorrecta = await bcrypt.compare(password, usuario.password);

        if (!passwordCorrecta) {
            return res.status(400).json({ mensaje: 'Email o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                cedula: usuario.cedula,
                telefono: usuario.telefono,
                rol: usuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

const actualizarPerfil = async (req, res) => {
    const usuarioId = req.usuario.id;
    const { nombre, telefono, passwordActual, passwordNueva } = req.body;

    if (!nombre || !telefono) {
        return res.status(400).json({ mensaje: 'Nombre y teléfono son obligatorios' });
    }

    if (!/^\d{10}$/.test(telefono)) {
        return res.status(400).json({ mensaje: 'El teléfono debe tener 10 dígitos' });
    }

    try {
        const [usuarios] = await db.query(
            'SELECT * FROM usuarios WHERE id = ?', [usuarioId]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        if (passwordNueva) {
            if (!passwordActual) {
                return res.status(400).json({ mensaje: 'Debes ingresar tu contraseña actual' });
            }
            if (passwordNueva.length < 8) {
                return res.status(400).json({ mensaje: 'La nueva contraseña debe tener mínimo 8 caracteres' });
            }
            const passwordCorrecta = await bcrypt.compare(passwordActual, usuarios[0].password);
            if (!passwordCorrecta) {
                return res.status(400).json({ mensaje: 'La contraseña actual es incorrecta' });
            }
            const passwordEncriptada = await bcrypt.hash(passwordNueva, 10);
            await db.query(
                'UPDATE usuarios SET nombre = ?, telefono = ?, password = ? WHERE id = ?',
                [nombre, telefono, passwordEncriptada, usuarioId]
            );
        } else {
            await db.query(
                'UPDATE usuarios SET nombre = ?, telefono = ? WHERE id = ?',
                [nombre, telefono, usuarioId]
            );
        }

        const [usuarioActualizado] = await db.query(
            'SELECT id, nombre, email, cedula, telefono, rol FROM usuarios WHERE id = ?',
            [usuarioId]
        );

        res.json({
            mensaje: 'Perfil actualizado exitosamente',
            usuario: usuarioActualizado[0]
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

module.exports = { registro, login, actualizarPerfil };