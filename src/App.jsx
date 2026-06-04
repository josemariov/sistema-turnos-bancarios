import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Perfil from './pages/Perfil';
import SalaEspera from './pages/SalaEspera';
import Estadisticas from './pages/Estadisticas';
import Cajero from './pages/Cajero';
import GestionCajeros from './pages/GestionCajeros';

function RutaProtegida({ children, rolRequerido }) {
    const token = sessionStorage.getItem('token');
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));

    if (!token) return <Navigate to="/login" />;
    if (rolRequerido && usuario?.rol !== rolRequerido) return <Navigate to="/dashboard" />;

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                    <RutaProtegida>
                        <Dashboard />
                    </RutaProtegida>
                } />
                <Route path="/perfil" element={
                    <RutaProtegida>
                        <Perfil />
                    </RutaProtegida>
                } />
                <Route path="/admin" element={
                    <RutaProtegida rolRequerido="admin">
                        <Admin />
                    </RutaProtegida>
                } />
                <Route path="/estadisticas" element={
                    <RutaProtegida rolRequerido="admin">
                        <Estadisticas />
                    </RutaProtegida>
                } />
                <Route path="/gestion-cajeros" element={
                    <RutaProtegida rolRequerido="admin">
                        <GestionCajeros />
                    </RutaProtegida>
                } />
                <Route path="/cajero" element={
                    <RutaProtegida rolRequerido="cajero">
                        <Cajero />
                    </RutaProtegida>
                } />
                <Route path="/sala-espera" element={<SalaEspera />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;