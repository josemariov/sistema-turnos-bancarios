import { useState, useEffect } from 'react';
import { obtenerEstadisticasAdmin } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';

function Estadisticas() {
    const [datos, setDatos] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            const res = await obtenerEstadisticasAdmin();
            setDatos(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const COLORES = ['#1a365d', '#3182ce', '#38a169', '#d69e2e', '#e53e3e', '#805ad5', '#dd6b20'];

    const datosHora = Array.from({ length: 24 }, (_, i) => ({
        hora: `${i}:00`,
        turnos: datos?.porHora?.find(h => h.hora === i)?.total || 0
    })).filter(h => h.turnos > 0);

    return (
        <div style={styles.container}>
            <div style={styles.navbar}>
                <div style={styles.navIzquierda}>
                    <span style={styles.navIcon}>🏦</span>
                    <h2 style={styles.navTitulo}>Banco Virtual - Estadísticas</h2>
                </div>
                <button style={styles.botonVolver} onClick={() => navigate('/admin')}>
                    ← Volver al Panel
                </button>
            </div>

            <div style={styles.contenido}>
                {datos?.resumen && (
                    <div style={styles.statsContainer}>
                        <div style={{...styles.statCard, borderTop: '4px solid #1a365d'}}>
                            <span style={styles.statNumero}>{datos.resumen.total_hoy}</span>
                            <span style={styles.statLabel}>Total hoy</span>
                        </div>
                        <div style={{...styles.statCard, borderTop: '4px solid #38a169'}}>
                            <span style={styles.statNumero}>{datos.resumen.atendidos_hoy}</span>
                            <span style={styles.statLabel}>✅ Atendidos</span>
                        </div>
                        <div style={{...styles.statCard, borderTop: '4px solid #d69e2e'}}>
                            <span style={styles.statNumero}>{datos.resumen.pendientes_hoy}</span>
                            <span style={styles.statLabel}>⏳ Pendientes</span>
                        </div>
                        <div style={{...styles.statCard, borderTop: '4px solid #e53e3e'}}>
                            <span style={styles.statNumero}>{datos.resumen.cancelados_hoy}</span>
                            <span style={styles.statLabel}>❌ Cancelados</span>
                        </div>
                    </div>
                )}

                <div style={styles.graficasGrid}>
                    <div style={styles.graficaCard}>
                        <h4 style={styles.graficaTitulo}>📊 Turnos por Servicio</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={datos?.porServicio || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="prefijo" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => [value, name === 'atendidos' ? 'Atendidos' : name === 'pendientes' ? 'Pendientes' : 'Cancelados']}
                                    labelFormatter={(label) => `Servicio: ${label}`}
                                />
                                <Legend />
                                <Bar dataKey="atendidos" fill="#38a169" name="Atendidos" />
                                <Bar dataKey="pendientes" fill="#d69e2e" name="Pendientes" />
                                <Bar dataKey="cancelados" fill="#e53e3e" name="Cancelados" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={styles.graficaCard}>
                        <h4 style={styles.graficaTitulo}>🥧 Distribución por Servicio</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={datos?.porServicio || []}
                                    dataKey="total"
                                    nameKey="servicio"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ prefijo, percent }) => `${prefijo} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {datos?.porServicio?.map((_, index) => (
                                        <Cell key={index} fill={COLORES[index % COLORES.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [value, name]} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {datosHora.length > 0 && (
                        <div style={{...styles.graficaCard, gridColumn: '1 / -1'}}>
                            <h4 style={styles.graficaTitulo}>📈 Turnos por Hora del Día</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={datosHora}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hora" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="turnos"
                                        stroke="#1a365d"
                                        strokeWidth={2}
                                        dot={{ fill: '#1a365d' }}
                                        name="Turnos"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    <div style={{...styles.graficaCard, gridColumn: '1 / -1'}}>
                        <h4 style={styles.graficaTitulo}>📋 Detalle por Servicio</h4>
                        <table style={styles.tabla}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Servicio</th>
                                    <th style={styles.th}>Código</th>
                                    <th style={styles.th}>Total</th>
                                    <th style={styles.th}>Atendidos</th>
                                    <th style={styles.th}>Pendientes</th>
                                    <th style={styles.th}>Cancelados</th>
                                    <th style={styles.th}>Tiempo Promedio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datos?.porServicio?.map((s, i) => (
                                    <tr key={i} style={styles.tr}>
                                        <td style={styles.td}>{s.servicio}</td>
                                        <td style={styles.td}>
                                            <span style={{...styles.badge, backgroundColor: COLORES[i % COLORES.length]}}>
                                                {s.prefijo}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{s.total}</td>
                                        <td style={{...styles.td, color: '#38a169', fontWeight: 'bold'}}>{s.atendidos}</td>
                                        <td style={{...styles.td, color: '#d69e2e', fontWeight: 'bold'}}>{s.pendientes}</td>
                                        <td style={{...styles.td, color: '#e53e3e', fontWeight: 'bold'}}>{s.cancelados}</td>
                                        <td style={styles.td}>{s.tiempo_promedio ? `~${Math.round(s.tiempo_promedio)} min` : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
    botonVolver: {
        backgroundColor: 'transparent',
        border: '1px solid white',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    contenido: { maxWidth: '1100px', margin: '40px auto', padding: '0 16px' },
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
    graficasGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
    },
    graficaCard: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    graficaTitulo: { color: '#1a365d', marginBottom: '16px' },
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
    }
};

export default Estadisticas;