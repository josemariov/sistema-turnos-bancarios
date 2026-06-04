import { useState } from 'react';
import { login } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await login({ email, password });
            sessionStorage.setItem('token', res.data.token);
            sessionStorage.setItem('usuario', JSON.stringify(res.data.usuario));

            if (res.data.usuario.rol === 'admin') {
                navigate('/admin');
            } else if (res.data.usuario.rol === 'cajero') {
                navigate('/cajero');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Email o contraseña incorrectos');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.titulo}>Iniciar Sesión</h2>
                <p style={styles.subtitulo}>Sistema de Turnos Virtuales</p>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div style={styles.grupo}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={styles.grupo}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button style={styles.boton} type="submit">
                        Iniciar Sesión
                    </button>
                </form>
                <p style={styles.link}>
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
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
        backgroundColor: '#f0f4f8'
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    titulo: {
        textAlign: 'center',
        color: '#2d3748',
        marginBottom: '8px'
    },
    subtitulo: {
        textAlign: 'center',
        color: '#718096',
        marginBottom: '24px',
        fontSize: '14px'
    },
    error: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '16px',
        textAlign: 'center'
    },
    grupo: {
        marginBottom: '16px'
    },
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
    boton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#4299e1',
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

export default Login;