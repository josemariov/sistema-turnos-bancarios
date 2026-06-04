import { useState, useEffect } from 'react';
import { miVentanilla, miFilaCajero, llamarSiguiente, finalizarTurno } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Cajero() {
    const [ventanilla, setVentanilla] = useState(null);
    const [turnos, setTurnos] = useState([]);
    const [turnoActual, setTurnoActual] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));

    useEffect(() => {
        cargarDatos();
        const intervalo = setInterval(cargarDatos, 15000);
        return () => clearInterval(intervalo);
    }, []);

    const cargarDatos = async () => {
        try {
            const res = await miFilaCajero();
            setVentanilla(res.data.ventanilla);
            setTurnos(res.data.turnos);
            setEstadisticas(res.data.estadisticas);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLlamarSiguiente = async () => {
        try {
            const res = await llamarSiguiente();
            setTurnoActual(res.data.turno);
            setMensaje(`¡Turno ${res.data.turno.codigo_turno || '#' + res.data.turno.numero_turno} llamado!`);
            setError('');
            cargarDatos();
            setTimeout(() => setMensaje(''), 5000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al llamar siguiente turno');
            setMensaje('');
        }
    };

    const handleFinalizarTurno = async () => {
        try {
            await finalizarTurno();
            setTurnoActual(null);
            setMensaje('Turno finalizado exitosamente');
            setError('');
            cargarDatos();
            setTimeout(() => setMensaje(''), 3000);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al finalizar turno');
        }
    };

    const handleCerrarSesion = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');
        navigate('/login');
    };

    const getColorEstado = (estado) => {
        const colores = {
            disponible: '#38a169',
            ocupada: '#e53e3e',
            cerrada: '#718096'
        };
        return colores[estado] || '#718096';
    };

    return (
        <div style={styles.container}>
            <div style={styles.navbar}>
                <div style={styles.navIzquierda}>
                    <span style={styles.navIcon}>🏦</span>
                    <h2 style={styles.navTitulo}>Banco Virtual - Panel Cajero</h2>
                </div>
                <div style={styles.navDerecha}>
                    <span style={styles.navUsuario}>👤 {usuario?.nombre}</span>
                    <button style={styles.botonSalir} onClick={handleCerrarSesion}>
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <div style={styles.contenido}>
                {ventanilla && (
                    <div style={styles.ventanillaHeader}>
                        <div style={styles.ventanillaInfo}>
                            <h3 style={styles.ventanillaTitulo}>
                                🏧 Ventanilla {ventanilla.numero}
                            </h3>
                            <p style={styles.ventanillaServicio}>{ventanilla.servicio_nombre}</p>
                        </div>
                        <span style={{
                            ...styles.estadoBadge,
                            backgroundColor: getColorEstado(ventanilla.estado)
                        }}>
                            {ventanilla.estado.toUpperCase()}
                        </span>
                    </div>
                )}

                {estadisticas && (
                    <div style={styles.statsContainer}>
                        <div style={styles.statCard}>
                            <span style={styles.statNumero}>{estadisticas.pendientes}</span>
                            <span style={styles.statLabel}>⏳ En espera</span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statNumero}>{estadisticas.en_atencion}</span>
                            <span style={styles.statLabel}>🔵 En atención</span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statNumero}>{estadisticas.atendidos}</span>
                            <span style={styles.statLabel}>✅ Atendidos hoy</span>
                        </div>
                    </div>
                )}

                {mensaje && <p style={styles.exito}>✅ {mensaje}</p>}
                {error && <p style={styles.error}>⚠️ {error}</p>}

                <div style={styles.gridPrincipal}>
                    <div style={styles.card}>
                        <h4 style={styles.cardTitulo}>🎫 Turno Actual</h4>
                        {ventanilla?.estado === 'ocupada' && turnoActual ? (
                            <div style={styles.turnoActualCard}>
                                <p style={styles.turnoNumero}>
                                    {turnoActual.codigo_turno || `#${turnoActual.numero_turno}`}
                                </p>
                                <p style={styles.turnoUsuario}>👤 {turnoActual.nombre}</p>
                                <p style={styles.turnoEmail}>{turnoActual.email}</p>
                                <p style={styles.turnoServicio}>{turnoActual.servicio_nombre}</p>
                                <button style={styles.botonFinalizar} onClick={handleFinalizarTurno}>
                                    ✅ Finalizar Atención
                                </button>
                            </div>
                        ) : (
                            <div style={styles.sinTurno}>
                                <p style={styles.sinTurnoIcon}>🟢</p>
                                <p style={styles.sinTurnoTexto}>Ventanilla disponible</p>
                                <button
                                    style={{
                                        ...styles.botonLlamar,
                                        opacity: turnos.length === 0 ? 0.5 : 1,
                                        cursor: turnos.length === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                    onClick={handleLlamarSiguiente}
                                    disabled={turnos.length === 0}
                                >
                                    🔔 Llamar Siguiente Turno
                                </button>
                                {turnos.length === 0 && (
                                    <p style={styles.sinTurnosTexto}>No hay turnos en espera</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={styles.card}>
                        <h4 style={styles.cardTitulo}>📋 Próximos Turnos</h4>
                        {turnos.length === 0 ? (
                            <p style={styles.sinDatos}>No hay turnos pendientes</p>
                        ) : (
                            <div style={styles.listaFila}>
                                {turnos.map((turno, index) => (
                                    <div key={turno.id} style={{
                                        ...styles.turnoItem,
                                        backgroundColor: index === 0 ? '#ebf8ff' : '#f7fafc',
                                        borderLeft: index === 0 ? '4px solid #3182ce' : '4px solid #e2e8f0'
                                    }}>
                                        <div style={styles.turnoItemIzquierda}>
                                            <span style={styles.turnoItemNumero}>
                                                {turno.codigo_turno || `#${turno.numero_turno}`}
                                            </span>
                                            <span style={styles.turnoItemUsuario}>{turno.nombre}</span>
                                        </div>
                                        {index === 0 && (
                                            <span style={styles.proximoBadge}>PRÓXIMO</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
    botonSalir: {
        backgroundColor: 'transparent',
        border: '1px solid white',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    contenido: { maxWidth: '900px', margin: '40px auto', padding: '0 16px' },
    ventanillaHeader: {
        backgroundColor: 'white',
        padding: '20px 24px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    ventanillaInfo: {},
    ventanillaTitulo: { color: '#1a365d', margin: '0 0 4px 0' },
    ventanillaServicio: { color: '#718096', margin: 0 },
    estadoBadge: {
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 'bold'
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
    gridPrincipal: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
    },
    card: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    cardTitulo: { color: '#1a365d', marginBottom: '16px' },
    turnoActualCard: { textAlign: 'center' },
    turnoNumero: {
        fontSize: '56px',
        fontWeight: 'bold',
        color: '#1a365d',
        margin: '0 0 8px 0'
    },
    turnoUsuario: { fontSize: '18px', color: '#2d3748', margin: '0 0 4px 0' },
    turnoEmail: { fontSize: '13px', color: '#718096', margin: '0 0 8px 0' },
    turnoServicio: { fontSize: '14px', color: '#4a5568', margin: '0 0 24px 0' },
    botonFinalizar: {
        backgroundColor: '#38a169',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        width: '100%'
    },
    sinTurno: { textAlign: 'center', padding: '16px' },
    sinTurnoIcon: { fontSize: '48px', margin: '0 0 8px 0' },
    sinTurnoTexto: { color: '#718096', marginBottom: '16px' },
    botonLlamar: {
        backgroundColor: '#1a365d',
        color: 'white',
        border: 'none',
        padding: '14px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        width: '100%',
        marginBottom: '8px'
    },
    sinTurnosTexto: { color: '#a0aec0', fontSize: '13px' },
    sinDatos: { color: '#718096', textAlign: 'center', padding: '32px' },
    listaFila: { display: 'flex', flexDirection: 'column', gap: '8px' },
    turnoItem: {
        padding: '12px',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    turnoItemIzquierda: { display: 'flex', flexDirection: 'column' },
    turnoItemNumero: { fontWeight: 'bold', color: '#1a365d', fontSize: '16px' },
    turnoItemUsuario: { fontSize: '12px', color: '#718096', marginTop: '2px' },
    proximoBadge: {
        backgroundColor: '#3182ce',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '10px',
        fontWeight: 'bold'
    }
};

export default Cajero;