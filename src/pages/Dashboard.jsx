/**
 * @module Dashboard
 * @description Panel principal del usuario bancario
 * Permite solicitar turnos, ver posición en fila y contador regresivo
 * @author Juan Sebastian Novoa Mejia
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { solicitarTurno, miTurno, posicionEnFila, cancelarTurno, historialTurnos, obtenerServicios } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [turno, setTurno] = useState(null);
    const [posicion, setPosicion] = useState(null);
    const [servicios, setServicios] = useState([]);
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [historial, setHistorial] = useState([]);
    const [verHistorial, setVerHistorial] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [tiempoRestante, setTiempoRestante] = useState(null);
    const navigate = useNavigate();
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));

    const getSaludo = () => {
        const hora = new Date().getHours();
        if (hora >= 5 && hora < 12) return '☀️ Buenos días';
        if (hora >= 12 && hora < 18) return '🌤️ Buenas tardes';
        return '🌙 Buenas noches';
    };

    useEffect(() => {
        cargarServicios();
        cargarMiTurno();
        cargarHistorial();

        const intervalo = setInterval(() => {
            cargarMiTurno();
        }, 30000);

        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        if (!posicion) return;

        let segundos = posicion.tiempoEstimado * 60;
        setTiempoRestante(segundos);

        const contador = setInterval(() => {
            setTiempoRestante(prev => {
                if (prev <= 1) {
                    clearInterval(contador);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(contador);
    }, [posicion]);

    const formatTiempo = (segundos) => {
        if (!segundos) return '0:00';
        const min = Math.floor(segundos / 60);
        const seg = segundos % 60;
        return `${min}:${seg.toString().padStart(2, '0')}`;
    };

    const cargarServicios = async () => {
        try {
            const res = await obtenerServicios();
            setServicios(res.data.servicios);
        } catch (err) {
            console.error(err);
        }
    };

    const cargarMiTurno = async () => {
        try {
            const res = await miTurno();
            setTurno(res.data.turno);
            if (res.data.turno.estado === 'pendiente') {
                const resPosicion = await posicionEnFila();
                setPosicion(resPosicion.data);
            }
        } catch (err) {
            setTurno(null);
        }
    };

    const cargarHistorial = async () => {
        try {
            const res = await historialTurnos();
            setHistorial(res.data.turnos);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSolicitarTurno = async () => {
        if (!servicioSeleccionado) {
            setError('Debes seleccionar un servicio');
            return;
        }
        try {
            await solicitarTurno(servicioSeleccionado);
            setMensaje('¡Turno solicitado exitosamente!');
            setError('');
            setServicioSeleccionado('');
            cargarMiTurno();
            cargarHistorial();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al solicitar turno');
            setMensaje('');
        }
    };

    const handleCancelarTurno = async () => {
        try {
            await cancelarTurno();
            setMensaje('Turno cancelado exitosamente');
            setError('');
            setTurno(null);
            setPosicion(null);
            cargarHistorial();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al cancelar turno');
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

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-CO', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.navbar}>
                <div style={styles.navIzquierda}>
                    <span style={styles.navIcon}>🏦</span>
                    <h2 style={styles.navTitulo}>Banco Virtual - Turnos</h2>
                </div>
                <div style={styles.navDerecha}>
                    <span style={styles.navUsuario}>👤 {usuario?.nombre}</span>
                    <button style={styles.botonHistorial} onClick={() => setVerHistorial(!verHistorial)}>
                        📋 Historial
                    </button>
                    <button style={styles.botonHistorial} onClick={() => navigate('/perfil')}>
                        👤 Mi Perfil
                    </button>
                    <button style={styles.botonHistorial} onClick={() => window.open('/sala-espera', '_blank')}>
                        📺 Sala de Espera
                    </button>
                    <button style={styles.botonSalir} onClick={handleCerrarSesion}>
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <div style={styles.contenido}>
                <h3 style={styles.bienvenida}>{getSaludo()}, {usuario?.nombre}!</h3>

                {mensaje && <p style={styles.exito}>{mensaje}</p>}
                {error && <p style={styles.error}>{error}</p>}

                {verHistorial ? (
                    <div style={styles.card}>
                        <h4 style={styles.cardTitulo}>📋 Historial de Turnos</h4>
                        {historial.length === 0 ? (
                            <p style={styles.sinDatos}>No tienes turnos anteriores</p>
                        ) : (
                            <table style={styles.tabla}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Turno</th>
                                        <th style={styles.th}>Servicio</th>
                                        <th style={styles.th}>Estado</th>
                                        <th style={styles.th}>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historial.map((t) => (
                                        <tr key={t.id} style={styles.tr}>
                                            <td style={styles.td}>{t.codigo_turno || `#${t.numero_turno}`}</td>
                                            <td style={styles.td}>{t.servicio_nombre}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    backgroundColor: getColorEstado(t.estado)
                                                }}>
                                                    {t.estado.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={styles.td}>{formatFecha(t.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <button style={styles.botonSecundario} onClick={() => setVerHistorial(false)}>
                            ← Volver
                        </button>
                    </div>
                ) : !turno || turno.estado === 'atendido' || turno.estado === 'cancelado' ? (
                    <div style={styles.card}>
                        <h4 style={styles.cardTitulo}>🏦 Solicitar Turno</h4>
                        <p style={styles.cardTexto}>Selecciona el servicio que necesitas</p>
                        <div style={styles.serviciosGrid}>
                            {servicios.map((servicio) => (
                                <div
                                    key={servicio.id}
                                    style={{
                                        ...styles.servicioCard,
                                        border: servicioSeleccionado == servicio.id
                                            ? '2px solid #4299e1'
                                            : '2px solid #e2e8f0',
                                        backgroundColor: servicioSeleccionado == servicio.id
                                            ? '#ebf8ff'
                                            : 'white'
                                    }}
                                    onClick={() => setServicioSeleccionado(servicio.id)}
                                >
                                    <p style={styles.servicioNombre}>{servicio.nombre}</p>
                                    <p style={styles.servicioDesc}>{servicio.descripcion}</p>
                                    <p style={styles.servicioTiempo}>⏱ ~{servicio.tiempo_estimado} min</p>
                                </div>
                            ))}
                        </div>
                        <button style={styles.botonPrincipal} onClick={handleSolicitarTurno}>
                            🎫 Solicitar Turno
                        </button>
                    </div>
                ) : (
                    <div style={styles.card}>
                        <h4 style={styles.cardTitulo}>Tu Turno Actual</h4>
                        <p style={styles.servicioActual}>🏦 {turno.servicio_nombre}</p>
                        <div style={styles.numeroTurno}>
                            {turno.codigo_turno || `#${turno.numero_turno}`}
                        </div>
                        <div style={{
                            ...styles.estadoBadge,
                            backgroundColor: getColorEstado(turno.estado)
                        }}>
                            {turno.estado.replace('_', ' ').toUpperCase()}
                        </div>

                        {posicion && turno.estado === 'pendiente' && (
                            <div style={styles.infoFila}>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoNumero}>{posicion.posicion}</span>
                                    <span style={styles.infoLabel}>Posición en fila</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoNumero}>{posicion.totalEnFila}</span>
                                    <span style={styles.infoLabel}>Total en fila</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoNumero}>~{posicion.tiempoEstimado} min</span>
                                    <span style={styles.infoLabel}>Tiempo estimado</span>
                                </div>
                            </div>
                        )}

                        {tiempoRestante !== null && turno.estado === 'pendiente' && (
                            <div style={styles.contador}>
                                <p style={styles.contadorLabel}>⏱ Tiempo estimado restante</p>
                                <p style={styles.contadorNumero}>{formatTiempo(tiempoRestante)}</p>
                            </div>
                        )}

                        <div style={styles.botonesAccion}>
                            <button style={styles.botonSecundario} onClick={cargarMiTurno}>
                                🔄 Actualizar estado
                            </button>
                            {turno.estado === 'pendiente' && (
                                <button style={styles.botonCancelar} onClick={handleCancelarTurno}>
                                    ❌ Cancelar turno
                                </button>
                            )}
                        </div>
                    </div>
                )}
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
    botonHistorial: {
        backgroundColor: 'transparent',
        border: '1px solid white',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    botonSalir: {
        backgroundColor: 'transparent',
        border: '1px solid white',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    contenido: { maxWidth: '700px', margin: '40px auto', padding: '0 16px' },
    bienvenida: {
        color: '#1a365d',
        marginBottom: '16px',
        fontSize: '20px'
    },
    exito: {
        backgroundColor: '#f0fff4',
        color: '#276749',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '16px'
    },
    error: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '16px'
    },
    card: {
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    cardTitulo: { color: '#1a365d', marginBottom: '8px', fontSize: '20px' },
    cardTexto: { color: '#718096', marginBottom: '24px' },
    serviciosGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '24px',
        textAlign: 'left'
    },
    servicioCard: {
        padding: '14px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    servicioNombre: { fontWeight: 'bold', color: '#2d3748', marginBottom: '4px' },
    servicioDesc: { fontSize: '12px', color: '#718096', marginBottom: '4px' },
    servicioTiempo: { fontSize: '12px', color: '#4299e1' },
    botonPrincipal: {
        backgroundColor: '#1a365d',
        color: 'white',
        border: 'none',
        padding: '14px 32px',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer'
    },
    servicioActual: { color: '#4a5568', marginBottom: '8px', fontSize: '16px' },
    numeroTurno: {
        fontSize: '72px',
        fontWeight: 'bold',
        color: '#1a365d',
        margin: '16px 0'
    },
    estadoBadge: {
        display: 'inline-block',
        color: 'white',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        marginBottom: '24px'
    },
    infoFila: {
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#ebf8ff',
        borderRadius: '8px'
    },
    infoItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    infoNumero: { fontSize: '24px', fontWeight: 'bold', color: '#1a365d' },
    infoLabel: { fontSize: '12px', color: '#718096', marginTop: '4px' },
    contador: {
        backgroundColor: '#fffaf0',
        border: '1px solid #f6ad55',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px'
    },
    contadorLabel: {
        color: '#744210',
        fontSize: '13px',
        marginBottom: '4px'
    },
    contadorNumero: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#c05621'
    },
    botonesAccion: { display: 'flex', gap: '12px', justifyContent: 'center' },
    botonSecundario: {
        backgroundColor: '#e2e8f0',
        color: '#4a5568',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    botonCancelar: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        border: '1px solid #fc8181',
        padding: '10px 24px',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    sinDatos: { color: '#718096', padding: '32px' },
    tabla: { width: '100%', borderCollapse: 'collapse', marginBottom: '16px' },
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
    td: { padding: '12px', color: '#4a5568', fontSize: '14px', textAlign: 'left' },
    badge: {
        color: 'white',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold'
    }
};

export default Dashboard;