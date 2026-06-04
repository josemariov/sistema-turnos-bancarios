import { useState } from 'react';
import { actualizarPerfil } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Perfil() {
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nombre: usuario?.nombre || '',
        telefono: usuario?.telefono || '',
        passwordActual: '',
        passwordNueva: '',
        confirmarPassword: ''
    });
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');

        if (!form.nombre || !form.telefono) {
            setError('Nombre y teléfono son obligatorios');
            return;
        }

        if (!/^\d{10}$/.test(form.telefono)) {
            setError('El teléfono debe tener exactamente 10 dígitos');
            return;
        }

        if (form.passwordNueva) {
            if (form.passwordNueva.length < 8) {
                setError('La nueva contraseña debe tener mínimo 8 caracteres');
                return;
            }
            if (form.passwordNueva !== form.confirmarPassword) {
                setError('Las contraseñas nuevas no coinciden');
                return;
            }
        }

        try {
            const res = await actualizarPerfil({
                nombre: form.nombre,
                telefono: form.telefono,
                passwordActual: form.passwordActual || undefined,
                passwordNueva: form.passwordNueva || undefined
            });

            sessionStorage.setItem('usuario', JSON.stringify(res.data.usuario));
            setExito('¡Perfil actualizado exitosamente!');
            setForm({ ...form, passwordActual: '', passwordNueva: '', confirmarPassword: '' });

        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al actualizar perfil');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.navbar}>
                <div style={styles.navIzquierda}>
                    <span style={styles.navIcon}>🏦</span>
                    <h2 style={styles.navTitulo}>Banco Virtual - Mi Perfil</h2>
                </div>
                <button style={styles.botonVolver} onClick={() => navigate('/dashboard')}>
                    ← Volver al Dashboard
                </button>
            </div>

            <div style={styles.contenido}>
                <div style={styles.card}>
                    <div style={styles.perfilHeader}>
                        <div style={styles.avatar}>
                            {usuario?.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 style={styles.perfilNombre}>{usuario?.nombre}</h3>
                            <p style={styles.perfilEmail}>{usuario?.email}</p>
                            <span style={styles.perfilRol}>{usuario?.rol}</span>
                        </div>
                    </div>

                    <div style={styles.infoCedula}>
                        <p style={styles.infoLabel}>📋 Cédula</p>
                        <p style={styles.infoValor}>{usuario?.cedula || 'No registrada'}</p>
                    </div>

                    {error && <p style={styles.error}>⚠️ {error}</p>}
                    {exito && <p style={styles.exito}>✅ {exito}</p>}

                    <form onSubmit={handleSubmit}>
                        <h4 style={styles.seccionTitulo}>Información Personal</h4>

                        <div style={styles.grupo}>
                            <label style={styles.label}>Nombre completo</label>
                            <input
                                style={styles.input}
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={styles.grupo}>
                            <label style={styles.label}>Teléfono</label>
                            <input
                                style={styles.input}
                                type="text"
                                name="telefono"
                                placeholder="10 dígitos"
                                value={form.telefono}
                                onChange={handleChange}
                                maxLength={10}
                            />
                        </div>

                        <h4 style={styles.seccionTitulo}>Cambiar Contraseña <span style={styles.opcional}>(opcional)</span></h4>

                        <div style={styles.grupo}>
                            <label style={styles.label}>Contraseña actual</label>
                            <input
                                style={styles.input}
                                type="password"
                                name="passwordActual"
                                placeholder="Tu contraseña actual"
                                value={form.passwordActual}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={styles.grid}>
                            <div style={styles.grupo}>
                                <label style={styles.label}>Nueva contraseña</label>
                                <input
                                    style={styles.input}
                                    type="password"
                                    name="passwordNueva"
                                    placeholder="Mínimo 8 caracteres"
                                    value={form.passwordNueva}
                                    onChange={handleChange}
                                />
                            </div>
                            <div style={styles.grupo}>
                                <label style={styles.label}>Confirmar contraseña</label>
                                <input
                                    style={styles.input}
                                    type="password"
                                    name="confirmarPassword"
                                    placeholder="Repite la nueva contraseña"
                                    value={form.confirmarPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button style={styles.boton} type="submit">
                            💾 Guardar Cambios
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    navbar: {
        backgroundColor: '#1a365d',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    navIzquierda: { display: 'flex', alignItems: 'center', gap: '10px' },
    navIcon: { fontSize: '24px' },
    navTitulo: { color: 'white', margin: 0, fontSize: '18px' },
    botonVolver: {
        backgroundColor: 'transparent',
        border: '1px solid white',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    contenido: { maxWidth: '600px', margin: '40px auto', padding: '0 16px' },
    card: {
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    perfilHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        paddingBottom: '24px',
        borderBottom: '1px solid #e2e8f0'
    },
    avatar: {
        width: '64px',
        height: '64px',
        backgroundColor: '#1a365d',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '28px',
        fontWeight: 'bold'
    },
    perfilNombre: { color: '#2d3748', margin: '0 0 4px 0' },
    perfilEmail: { color: '#718096', margin: '0 0 8px 0', fontSize: '14px' },
    perfilRol: {
        backgroundColor: '#ebf8ff',
        color: '#2b6cb0',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    infoCedula: {
        backgroundColor: '#f7fafc',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    infoLabel: { color: '#4a5568', fontSize: '14px', margin: 0 },
    infoValor: { color: '#2d3748', fontWeight: 'bold', margin: 0 },
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
    seccionTitulo: {
        color: '#1a365d',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid #e2e8f0'
    },
    opcional: { fontSize: '12px', color: '#718096', fontWeight: 'normal' },
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
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
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
    }
};

export default Perfil;