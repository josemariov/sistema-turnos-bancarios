/**
 * @module Register
 * @description Componente de registro de nuevos usuarios bancarios
 * Incluye validaciones de cédula, teléfono, email y contraseña
 * @author Juan Sebastian Novoa Mejia
 * @version 1.0.0
 */

import { useState } from 'react';
import { registro } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [form, setForm] = useState({
        nombre: '',
        email: '',
        cedula: '',
        telefono: '',
        password: '',
        confirmarPassword: ''
    });
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validar = () => {
        if (!form.nombre || !form.email || !form.cedula || !form.telefono || !form.password || !form.confirmarPassword) {
            return 'Todos los campos son obligatorios';
        }
        if (form.nombre.length < 3) {
            return 'El nombre debe tener mínimo 3 caracteres';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            return 'El email no es válido';
        }
        if (!/^\d{7,10}$/.test(form.cedula)) {
            return 'La cédula debe tener entre 7 y 10 dígitos';
        }
        if (!/^\d{10}$/.test(form.telefono)) {
            return 'El teléfono debe tener exactamente 10 dígitos';
        }
        if (form.password.length < 8) {
            return 'La contraseña debe tener mínimo 8 caracteres';
        }
        if (form.password !== form.confirmarPassword) {
            return 'Las contraseñas no coinciden';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errorValidacion = validar();
        if (errorValidacion) {
            setError(errorValidacion);
            return;
        }
        try {
            await registro({
                nombre: form.nombre,
                email: form.email,
                cedula: form.cedula,
                telefono: form.telefono,
                password: form.password
            });
            setExito('¡Registro exitoso! Redirigiendo al login...');
            setError('');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrarse');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <span style={styles.icon}>🏦</span>
                    <h2 style={styles.titulo}>Crear Cuenta</h2>
                    <p style={styles.subtitulo}>Sistema de Turnos Virtuales - Banco</p>
                </div>

                {error && <p style={styles.error}>⚠️ {error}</p>}
                {exito && <p style={styles.exito}>✅ {exito}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.grid}>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Nombre completo</label>
                            <input
                                style={styles.input}
                                type="text"
                                name="nombre"
                                placeholder="Tu nombre completo"
                                value={form.nombre}
                                onChange={handleChange}
                            />
                        </div>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Número de cédula</label>
                            <input
                                style={styles.input}
                                type="text"
                                name="cedula"
                                placeholder="Ej: 1234567890"
                                value={form.cedula}
                                onChange={(e) => {
                                    const valor = e.target.value.replace(/[^0-9]/g, '');
                                    setForm({ ...form, cedula: valor });
                                }}
                                maxLength={10}
                            />
                        </div>
                    </div>

                    <div style={styles.grid}>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Email</label>
                            <input
                                style={styles.input}
                                type="email"
                                name="email"
                                placeholder="tu@email.com"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Teléfono</label>
                            <input
                                style={styles.input}
                                type="text"
                                name="telefono"
                                placeholder="Ej: 3001234567"
                                value={form.telefono}
                                onChange={(e) => {
                                    const valor = e.target.value.replace(/[^0-9]/g, '');
                                    setForm({ ...form, telefono: valor });
                                }}
                                maxLength={10}
                            />
                        </div>
                    </div>

                    <div style={styles.grid}>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Contraseña</label>
                            <input
                                style={styles.input}
                                type="password"
                                name="password"
                                placeholder="Mínimo 8 caracteres"
                                value={form.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Confirmar contraseña</label>
                            <input
                                style={styles.input}
                                type="password"
                                name="confirmarPassword"
                                placeholder="Repite tu contraseña"
                                value={form.confirmarPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={styles.requisitos}>
                        <p style={styles.requisitosTitulo}>Requisitos:</p>
                        <p style={{ ...styles.requisito, color: form.password.length >= 8 ? '#38a169' : '#718096' }}>
                            {form.password.length >= 8 ? '✅' : '○'} Mínimo 8 caracteres
                        </p>
                        <p style={{ ...styles.requisito, color: form.password && form.password === form.confirmarPassword ? '#38a169' : '#718096' }}>
                            {form.password && form.password === form.confirmarPassword ? '✅' : '○'} Las contraseñas coinciden
                        </p>
                        <p style={{ ...styles.requisito, color: /^\d{7,10}$/.test(form.cedula) ? '#38a169' : '#718096' }}>
                            {/^\d{7,10}$/.test(form.cedula) ? '✅' : '○'} Cédula válida (7-10 dígitos)
                        </p>
                        <p style={{ ...styles.requisito, color: /^\d{10}$/.test(form.telefono) ? '#38a169' : '#718096' }}>
                            {/^\d{10}$/.test(form.telefono) ? '✅' : '○'} Teléfono válido (10 dígitos)
                        </p>
                    </div>

                    <button style={styles.boton} type="submit">
                        Crear Cuenta
                    </button>
                </form>
                <p style={styles.link}>
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4f8',
        padding: '20px'
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '600px'
    },
    header: { textAlign: 'center', marginBottom: '24px' },
    icon: { fontSize: '40px' },
    titulo: { color: '#1a365d', marginBottom: '4px' },
    subtitulo: { color: '#718096', fontSize: '14px' },
    error: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    exito: {
        backgroundColor: '#f0fff4',
        color: '#276749',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
    },
    grupo: { marginBottom: '16px' },
    label: {
        display: 'block',
        marginBottom: '6px',
        color: '#4a5568',
        fontSize: '14px',
        fontWeight: 'bold'
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    requisitos: {
        backgroundColor: '#f7fafc',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px'
    },
    requisitosTitulo: {
        color: '#4a5568',
        fontSize: '13px',
        fontWeight: 'bold',
        marginBottom: '6px'
    },
    requisito: {
        fontSize: '13px',
        marginBottom: '4px'
    },
    boton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#1a365d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '8px'
    },
    link: {
        textAlign: 'center',
        marginTop: '16px',
        fontSize: '14px',
        color: '#718096'
    }
};

export default Register;