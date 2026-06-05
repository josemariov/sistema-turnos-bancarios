/**
 * @module Admin
 * @description Panel administrativo del sistema bancario
 * Gestiona turnos, ventanillas, filtros y estadísticas en tiempo real
 * @author Juan Sebastian Novoa Mejia
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { verTodosTurnos, actualizarEstado, verFila, obtenerVentanillas } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Admin() {
    const [turnos, setTurnos] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [ventanillas, setVentanillas] = useState([]);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroServicio, setFiltroServicio] = useState('todos');
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const resTurnos = await verTodosTurnos();
            setTurnos(resTurnos.data.turnos);
            const resFila = await verFila();
            setEstadisticas(resFila.data.estadisticas);
            const resVentanillas = await obtenerVentanillas();
            setVentanillas(resVentanillas.data.ventanillas);
        } catch (err) {
            console.error(err);
        }
    };

    const handleActualizarEstado = async (id, nuevoEstado, servicioId) => {
        try {
            let ventanillaId = null;

            if (nuevoEstado === 'en_atencion') {
                const ventanillaDisponible = ventanillas.find(
                    v => v.servicio_id === servicioId && v.estado === 'disponible'
                );
                if (ventanillaDisponible) {
                    ventanillaId = ventanillaDisponible.id;
                }
            }

            await actualizarEstado(id, nuevoEstado, ventanillaId);
            setMensaje('Estado actualizado correctamente');
            cargarDatos();
            setTimeout(() => setMensaje(''), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCerrarSesion = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');
        navigate('/login');
    };

    const getColorEstado = (estado) => {
        const colores = {
            pendiente: '#d69e2e',
            en_atencion: '#3182ce',
            atendido: '#38a169',
            cancelado: '#e53e3e'
        };
        return colores[estado] || '#718096';
    };

    const getColorVentanilla = (estado) => {
        const colores = {
            disponible: '#38a169',
            ocupada: '#e53e3e',
            cerrada: '#718096'
        };
        return colores[estado] || '#718096';
    };

    const turnosFiltrados = turnos.filter(t => {
        const matchEstado = filtroEstado === 'todos' || t.estado === filtroEstado;
        const matchServicio = filtroServicio === 'todos' || t.servicio_nombre === filtroServicio;
        return matchEstado && matchServicio;
    });

    const serviciosUnicos = [...new Set(turnos.map(t => t.servicio_nombre).filter(Boolean))];

    return (
        <div style={styles.container}>
            <div style={styles.navbar}>
                <div style={styles.navIzquierda}>
                    <span style={styles.navIcon}>🏦</span>
                    <h2 style={styles.navTitulo}>Banco Virtual - Panel Admin</h2>
                </div>
                <div style={styles.navDerecha}>
                    <span style={styles.navUsuario}>👤 {usuario?.nombre}</span>
                    <button style={styles.botonEstadisticas} onClick={() => navigate('/estadisticas')}>
                        📊 Estadísticas
                    </button>
                    <button style={styles.botonEstadisticas} onClick={() => navigate('/gestion-cajeros')}>
                        👥 Cajeros
                    </button>
                    <button style={styles.botonSalir} onClick={handleCerrarSesion}>
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <div style={styles.contenido}>
                {mensaje && <p style={styles.exito}>{mensaje}</p>}

                {estadisticas && (
                    <div style={styles.statsContainer}>
                        <div style={{ ...styles.statCard, borderTop: '4px solid #d69e2e' }}>
                            <span style={styles.statNumero}>{estadisticas.pendientes}</span>
                            <span style={styles.statLabel}>⏳ Pendientes</span>
                        </div>
                        <div style={{ ...styles.statCard, borderTop: '4px solid #3182ce' }}>
                            <span style={styles.statNumero}>{estadisticas.en_atencion}</span>
                            <span style={styles.statLabel}>🔵 En Atención</span>
                        </div>
                        <div style={{ ...styles.statCard, borderTop: '4px solid #38a169' }}>
                            <span style={styles.statNumero}>{estadisticas.atendidos}</span>
                            <span style={styles.statLabel}>✅ Atendidos</span>
                        </div>
                        <div style={{ ...styles.statCard, borderTop: '4px solid #e53e3e' }}>
                            <span style={styles.statNumero}>{estadisticas.cancelados}</span>
                            <span style={styles.statLabel}>❌ Cancelados</span>
                        </div>
                    </div>
                )}

                <div style={styles.card}>
                    <h4 style={styles.cardTitulo}>🏧 Estado de Ventanillas</h4>
                    <div style={styles.ventanillasGrid}>
                        {ventanillas.map((v) => (
                            <div key={v.id} style={{
                                ...styles.ventanillaCard,
                                borderLeft: `4px solid ${getColorVentanilla(v.estado)}`
                            }}>
                                <p style={styles.ventanillaNumero}>Ventanilla {v.numero}</p>
                                <p style={styles.ventanillaServicio}>{v.servicio_nombre}</p>
                                <span style={{
                                    ...styles.ventanillaBadge,
                                    backgroundColor: getColorVentanilla(v.estado)
                                }}>
                                    {v.estado}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h4 style={styles.cardTitulo}>📋 Lista de Turnos</h4>
                        <button style={styles.botonActualizar} onClick={cargarDatos}>
                            🔄 Actualizar
                        </button>
                    </div>

                    <div style={styles.filtros}>
                        <select style={styles.filtro} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                            <option value="todos">Todos los estados</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="en_atencion">En Atención</option>
                            <option value="atendido">Atendido</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                        <select style={styles.filtro} value={filtroServicio} onChange={(e) => setFiltroServicio(e.target.value)}>
                            <option value="todos">Todos los servicios</option>
                            {serviciosUnicos.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {turnosFiltrados.length === 0 ? (
                        <p style={styles.sinTurnos}>No hay turnos que mostrar</p>
                    ) : (
                        <table style={styles.tabla}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Turno</th>
                                    <th style={styles.th}>Usuario</th>
                                    <th style={styles.th}>Servicio</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {turnosFiltrados.map((turno) => (
                                    <tr key={turno.id} style={styles.tr}>
                                        <td style={styles.td}>{turno.codigo_turno || `#${turno.numero_turno}`}</td>
                                        <td style={styles.td}>
                                            <div>{turno.nombre}</div>
                                            <div style={styles.email}>{turno.email}</div>
                                        </td>
                                        <td style={styles.td}>{turno.servicio_nombre || 'N/A'}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: getColorEstado(turno.estado)
                                            }}>
                                                {turno.estado.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <select
                                                style={styles.select}
                                                value={turno.estado}
                                                onChange={(e) => handleActualizarEstado(turno.id, e.target.value, turno.servicio_id)}
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="en_atencion">En Atención</option>
                                                <option value="atendido">Atendido</option>
                                                <option value="cancelado">Cancelado</option>
                                            </select>
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
    navDerecha: { display: 'flex', alignItems: 'center', gap: '12px' },
    navUsuario: { color: 'white', fontSize: '14px' },
    botonEstadisticas: {
        backgroundColor: '#f6ad55',
        border: 'none',
        color: '#1a365d',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    botonSalir: {
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
    statsContainer: {
        display: 'flex',
        gap: '16px',
        marginBottom: '24px'
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    statNumero: { fontSize: '32px', fontWeight: 'bold', color: '#1a365d' },
    statLabel: { fontSize: '12px', color: '#718096', marginTop: '4px' },
    card: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '24px'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    cardTitulo: { color: '#1a365d', margin: '0 0 16px 0' },
    ventanillasGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px'
    },
    ventanillaCard: {
        padding: '12px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px'
    },
    ventanillaNumero: { fontWeight: 'bold', color: '#2d3748', margin: '0 0 4px 0', fontSize: '13px' },
    ventanillaServicio: { color: '#718096', margin: '0 0 8px 0', fontSize: '11px' },
    ventanillaBadge: {
        color: 'white',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '10px',
        fontWeight: 'bold'
    },
    botonActualizar: {
        backgroundColor: '#ebf8ff',
        color: '#2b6cb0',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    filtros: { display: 'flex', gap: '12px', marginBottom: '16px' },
    filtro: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        cursor: 'pointer'
    },
    sinTurnos: { textAlign: 'center', color: '#718096', padding: '32px' },
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
    email: { fontSize: '11px', color: '#a0aec0' },
    badge: {
        color: 'white',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold'
    },
    select: {
        padding: '6px',
        borderRadius: '4px',
        border: '1px solid #e2e8f0',
        fontSize: '13px',
        cursor: 'pointer'
    }
};

export default Admin;