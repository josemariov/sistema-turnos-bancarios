import { useState, useEffect } from 'react';
import { verFila } from '../services/api';

function SalaEspera() {
    const [fila, setFila] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [hora, setHora] = useState(new Date());

    useEffect(() => {
        cargarFila();
        const intervaloFila = setInterval(cargarFila, 15000);
        const intervaloHora = setInterval(() => setHora(new Date()), 1000);
        return () => {
            clearInterval(intervaloFila);
            clearInterval(intervaloHora);
        };
    }, []);

    const cargarFila = async () => {
        try {
            const res = await verFila();
            setFila(res.data.fila);
            setEstadisticas(res.data.estadisticas);
        } catch (err) {
            console.error(err);
        }
    };

    const formatHora = (fecha) => {
        return fecha.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatFecha = (fecha) => {
        return fecha.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerIzquierda}>
                    <span style={styles.headerIcon}>🏦</span>
                    <div>
                        <h1 style={styles.headerTitulo}>Banco Virtual</h1>
                        <p style={styles.headerSubtitulo}>Sistema de Turnos Virtuales</p>
                    </div>
                </div>
                <div style={styles.headerDerecha}>
                    <p style={styles.fecha}>{formatFecha(hora)}</p>
                    <p style={styles.reloj}>{formatHora(hora)}</p>
                </div>
            </div>

            {estadisticas && (
                <div style={styles.statsBar}>
                    <div style={styles.statItem}>
                        <span style={styles.statNum}>{estadisticas.pendientes}</span>
                        <span style={styles.statLbl}>En espera</span>
                    </div>
                    <div style={styles.statDivider} />
                    <div style={styles.statItem}>
                        <span style={styles.statNum}>{estadisticas.en_atencion}</span>
                        <span style={styles.statLbl}>En atención</span>
                    </div>
                    <div style={styles.statDivider} />
                    <div style={styles.statItem}>
                        <span style={styles.statNum}>{estadisticas.atendidos}</span>
                        <span style={styles.statLbl}>Atendidos hoy</span>
                    </div>
                </div>
            )}

            <div style={styles.contenido}>
                <div style={styles.filaContainer}>
                    <h2 style={styles.seccionTitulo}>⏳ Turnos en Espera</h2>
                    {fila.length === 0 ? (
                        <div style={styles.sinTurnos}>
                            <p style={styles.sinTurnosIcon}>✅</p>
                            <p style={styles.sinTurnosTexto}>No hay turnos en espera</p>
                        </div>
                    ) : (
                        <div style={styles.turnosGrid}>
                            {fila.map((turno, index) => (
                                <div key={turno.id} style={{
                                    ...styles.turnoCard,
                                    backgroundColor: index === 0 ? '#1a365d' : 'white',
                                    color: index === 0 ? 'white' : '#2d3748'
                                }}>
                                    {index === 0 && (
                                        <p style={styles.proximoLabel}>🔔 PRÓXIMO</p>
                                    )}
                                    <p style={{
                                        ...styles.turnoNumero,
                                        color: index === 0 ? 'white' : '#1a365d'
                                    }}>
                                        #{turno.numero_turno}
                                    </p>
                                    <p style={{
                                        ...styles.turnoServicio,
                                        color: index === 0 ? '#bee3f8' : '#718096'
                                    }}>
                                        {turno.servicio_nombre || 'General'}
                                    </p>
                                    <p style={{
                                        ...styles.turnoUsuario,
                                        color: index === 0 ? '#e2e8f0' : '#4a5568'
                                    }}>
                                        👤 {turno.nombre}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={styles.infoContainer}>
                    <h2 style={styles.seccionTitulo}>ℹ️ Información</h2>
                    <div style={styles.infoCard}>
                        <p style={styles.infoTitulo}>📱 ¿Cómo funciona?</p>
                        <div style={styles.pasos}>
                            <div style={styles.paso}>
                                <span style={styles.pasoNum}>1</span>
                                <span style={styles.pasoTexto}>Regístrate o inicia sesión</span>
                            </div>
                            <div style={styles.paso}>
                                <span style={styles.pasoNum}>2</span>
                                <span style={styles.pasoTexto}>Selecciona el servicio que necesitas</span>
                            </div>
                            <div style={styles.paso}>
                                <span style={styles.pasoNum}>3</span>
                                <span style={styles.pasoTexto}>Solicita tu turno virtual</span>
                            </div>
                            <div style={styles.paso}>
                                <span style={styles.pasoNum}>4</span>
                                <span style={styles.pasoTexto}>Espera desde donde quieras</span>
                            </div>
                            <div style={styles.paso}>
                                <span style={styles.pasoNum}>5</span>
                                <span style={styles.pasoTexto}>Preséntate cuando sea tu turno</span>
                            </div>
                        </div>
                        <div style={styles.qrContainer}>
                            <p style={styles.qrTexto}>Accede al sistema:</p>
                            <p style={styles.qrUrl}>localhost:5173</p>
                        </div>
                    </div>

                    <div style={styles.serviciosCard}>
                        <p style={styles.infoTitulo}>🏦 Servicios Disponibles</p>
                        <div style={styles.serviciosList}>
                            {['Caja', 'Atención al Cliente', 'Créditos y Préstamos',
                              'Apertura de Cuentas', 'Tarjetas', 'Inversiones', 'Cambio de Divisas'
                            ].map(s => (
                                <div key={s} style={styles.servicioItem}>
                                    <span style={styles.servicioCheck}>✓</span>
                                    <span style={styles.servicioNombre}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.footer}>
                <p style={styles.footerTexto}>
                    Esta pantalla se actualiza automáticamente cada 15 segundos
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#0f2744', color: 'white' },
    header: {
        backgroundColor: '#1a365d',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '3px solid #f6ad55'
    },
    headerIzquierda: { display: 'flex', alignItems: 'center', gap: '16px' },
    headerIcon: { fontSize: '48px' },
    headerTitulo: { margin: 0, fontSize: '28px', color: 'white' },
    headerSubtitulo: { margin: 0, fontSize: '14px', color: '#bee3f8' },
    headerDerecha: { textAlign: 'right' },
    fecha: { margin: 0, fontSize: '14px', color: '#bee3f8', textTransform: 'capitalize' },
    reloj: { margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#f6ad55' },
    statsBar: {
        backgroundColor: '#1a365d',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
        alignItems: 'center'
    },
    statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    statNum: { fontSize: '32px', fontWeight: 'bold', color: '#f6ad55' },
    statLbl: { fontSize: '12px', color: '#bee3f8' },
    statDivider: { width: '1px', height: '40px', backgroundColor: '#2d5a8e' },
    contenido: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        padding: '24px 32px'
    },
    filaContainer: {},
    seccionTitulo: { color: '#f6ad55', marginBottom: '16px', fontSize: '18px' },
    sinTurnos: { textAlign: 'center', padding: '48px' },
    sinTurnosIcon: { fontSize: '48px', marginBottom: '8px' },
    sinTurnosTexto: { color: '#bee3f8', fontSize: '18px' },
    turnosGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
    },
    turnoCard: {
        padding: '16px',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    },
    proximoLabel: { fontSize: '11px', fontWeight: 'bold', margin: '0 0 8px 0' },
    turnoNumero: { fontSize: '36px', fontWeight: 'bold', margin: '0 0 4px 0' },
    turnoServicio: { fontSize: '12px', margin: '0 0 8px 0' },
    turnoUsuario: { fontSize: '13px', margin: 0 },
    infoContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
    infoCard: {
        backgroundColor: '#1a365d',
        padding: '20px',
        borderRadius: '10px'
    },
    infoTitulo: { fontWeight: 'bold', color: '#f6ad55', marginBottom: '12px', fontSize: '15px' },
    pasos: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
    paso: { display: 'flex', alignItems: 'center', gap: '10px' },
    pasoNum: {
        width: '24px', height: '24px',
        backgroundColor: '#f6ad55',
        color: '#1a365d',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: 'bold', flexShrink: 0
    },
    pasoTexto: { fontSize: '13px', color: '#bee3f8' },
    qrContainer: {
        backgroundColor: '#0f2744',
        padding: '12px',
        borderRadius: '8px',
        textAlign: 'center'
    },
    qrTexto: { color: '#bee3f8', fontSize: '12px', margin: '0 0 4px 0' },
    qrUrl: { color: '#f6ad55', fontWeight: 'bold', fontSize: '16px', margin: 0 },
    serviciosCard: {
        backgroundColor: '#1a365d',
        padding: '20px',
        borderRadius: '10px'
    },
    serviciosList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    servicioItem: { display: 'flex', alignItems: 'center', gap: '8px' },
    servicioCheck: { color: '#68d391', fontWeight: 'bold' },
    servicioNombre: { fontSize: '13px', color: '#bee3f8' },
    footer: {
        textAlign: 'center',
        padding: '12px',
        backgroundColor: '#1a365d',
        borderTop: '1px solid #2d5a8e'
    },
    footerTexto: { color: '#718096', fontSize: '12px', margin: 0 }
};

export default SalaEspera;