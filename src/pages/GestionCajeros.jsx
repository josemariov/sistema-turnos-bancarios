import { useState, useEffect } from 'react';
import { obtenerCajeros, crearCajero, toggleVentanilla, obtenerVentanillas } from '../services/api';
import { useNavigate } from 'react-router-dom';

function GestionCajeros() {
    const [cajeros, setCajeros] = useState([]);
    const [ventanillas, setVentanillas] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        nombre: '',
        email: '',
        password: '',
        cedula: '',
        telefono: '',
        ventanilla_id: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const resCajeros = await obtenerCajeros();
            setCajeros(resCajeros.data.cajeros);
            const resVentanillas = await obtenerVentanillas();
            setVentanillas(resVentanillas.data.ventanillas);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCrearCajero = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.nombre || !form.email || !form.password || !form.cedula || !form.telefono) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (form.password.length < 8) {
            setError('La contraseña debe tener mínimo 8 caracteres');
            return;
        }

        try {
            await crearCajero(form);
            setMensaje('Cajero creado exitosamente');
            setError('');
            setForm({ nombre: '', email: '', password: '', cedula: '', telefono: '', ventanilla_id: '' });
            setMostrarForm(false);
            cargarDatos();
            setTimeout(() => setMensaje(''), 3000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al crear cajero');
        }
    };

    const handleToggleVentanilla = async (ventanillaId, estadoActual) => {
        try {
            const res = await toggleVentanilla(ventanillaId);
            setMensaje(res.data.mensaje);
            cargarDatos();
            setTimeout(() => setMensaje(''), 3000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al cambiar estado de ventanilla');
        }
    };

    const getColorVentanilla = (estado) => {
        const colores = {
            disponible: '#38a169',
            ocupada: '#3182ce',
            cerrada: '#718096'
        };
        return colores[estado] || '#718096';
    };

    const ventanillasSinCajero = ventanillas.filter(v => !v.cajero_id);

    return (
        <div style={styles.container}>
            <div style={styles.navbar}>
                <div style={styles.navIzquierda}>
                    <span style={styles.navIcon}>🏦</span>
                    <h2 style={styles.navTitulo}>Banco Virtual - Gestión de Cajeros</h2>
                </div>
                <button style={styles.botonVolver} onClick={() => navigate('/admin')}>
                    ← Volver al Panel
                </button>
            </div>

            <div style={styles.contenido}>
                {mensaje && <p style={styles.exito}>✅ {mensaje}</p>}
                {error && <p style={styles.errorMsg}>⚠️ {error}</p>}

                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h4 style={styles.cardTitulo}>👥 Cajeros Registrados</h4>
                        <button style={styles.botonAgregar} onClick={() => setMostrarForm(!mostrarForm)}>
                            {mostrarForm ? '✕ Cancelar' : '+ Nuevo Cajero'}
                        </button>
                    </div>

                    {mostrarForm && (
                        <div style={styles.formulario}>
                            <h4 style={styles.formTitulo}>Crear Nuevo Cajero</h4>
                            <form onSubmit={handleCrearCajero}>
                                <div style={styles.grid}>
                                    <div style={styles.grupo}>
                                        <label style={styles.label}>Nombre completo</label>
                                        <input
                                            style={styles.input}
                                            type="text"
                                            name="nombre"
                                            placeholder="Nombre del cajero"
                                            value={form.nombre}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div style={styles.grupo}>
                                        <label style={styles.label}>Cédula</label>
                                        <input
                                            style={styles.input}
                                            type="text"
                                            name="cedula"
                                            placeholder="Número de cédula"
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
                                            placeholder="email@banco.com"
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
                                            placeholder="10 dígitos"
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
                                        <label style={styles.label}>Asignar Ventanilla</label>
                                        <select
                                            style={styles.input}
                                            name="ventanilla_id"
                                            value={form.ventanilla_id}
                                            onChange={handleChange}
                                        >
                                            <option value="">Sin ventanilla</option>
                                            {ventanillasSinCajero.map(v => (
                                                <option key={v.id} value={v.id}>
                                                    Ventanilla {v.numero} - {v.servicio_nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button style={styles.botonGuardar} type="submit">
                                    💾 Crear Cajero
                                </button>
                            </form>
                        </div>
                    )}

                    {cajeros.length === 0 ? (
                        <p style={styles.sinDatos}>No hay cajeros registrados</p>
                    ) : (
                        <table style={styles.tabla}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Nombre</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Cédula</th>
                                    <th style={styles.th}>Ventanilla</th>
                                    <th style={styles.th}>Servicio</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cajeros.map((cajero) => (
                                    <tr key={cajero.id} style={styles.tr}>
                                        <td style={styles.td}>{cajero.nombre}</td>
                                        <td style={styles.td}>{cajero.email}</td>
                                        <td style={styles.td}>{cajero.cedula}</td>
                                        <td style={styles.td}>
                                            {cajero.ventanilla_numero ? `Ventanilla ${cajero.ventanilla_numero}` : 'Sin asignar'}
                                        </td>
                                        <td style={styles.td}>{cajero.servicio_nombre || 'N/A'}</td>
                                        <td style={styles.td}>
                                            {cajero.ventanilla_id ? (
                                                <span style={{
                                                    ...styles.badge,
                                                    backgroundColor: getColorVentanilla(cajero.ventanilla_estado)
                                                }}>
                                                    {cajero.ventanilla_estado}
                                                </span>
                                            ) : (
                                                <span style={{...styles.badge, backgroundColor: '#718096'}}>
                                                    sin ventanilla
                                                </span>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            {cajero.ventanilla_id && cajero.ventanilla_estado !== 'ocupada' && (
                                                <button
                                                    style={{
                                                        ...styles.botonToggle,
                                                        backgroundColor: cajero.ventanilla_estado === 'cerrada' ? '#38a169' : '#e53e3e'
                                                    }}
                                                    onClick={() => handleToggleVentanilla(cajero.ventanilla_id, cajero.ventanilla_estado)}
                                                >
                                                    {cajero.ventanilla_estado === 'cerrada' ? '🟢 Abrir' : '🔴 Cerrar'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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
    contenido: { maxWidth: '1000px', margin: '40px auto', padding: '0 16px' },
    exito: {
        backgroundColor: '#f0fff4',
        color: '#276749',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '16px'
    },
    errorMsg: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '16px'
    },
    card: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    cardTitulo: { color: '#1a365d', margin: 0 },
    botonAgregar: {
        backgroundColor: '#1a365d',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    formulario: {
        backgroundColor: '#f7fafc',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px'
    },
    formTitulo: { color: '#1a365d', marginBottom: '16px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
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
    botonGuardar: {
        backgroundColor: '#38a169',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        fontSize: '15px',
        cursor: 'pointer'
    },
    sinDatos: { textAlign: 'center', color: '#718096', padding: '32px' },
    tabla: { width: '100%', borderCollapse: 'collapse' },
    th: {
        textAlign: 'left',
        padding: '12px',
        backgroundColor: '#f7fafc',
        color: '#4a5568',
        fontSize: '13px',
        fontWeight: 'bold',
        borderBottom: '1px solid #e2e8f0'
    },
    tr: { borderBottom: '1px solid #e2e8f0' },
    td: { padding: '12px', color: '#4a5568', fontSize: '14px' },
    badge: {
        color: 'white',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold'
    },
    botonToggle: {
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold'
    }
};

export default GestionCajeros;