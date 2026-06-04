import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000/api'
});

API.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const registro = (datos) => API.post('/auth/registro', datos);
export const login = (datos) => API.post('/auth/login', datos);
export const solicitarTurno = (servicio_id) => API.post('/turnos/solicitar', { servicio_id });
export const miTurno = () => API.get('/turnos/miturno');
export const posicionEnFila = () => API.get('/turnos/posicion');
export const cancelarTurno = () => API.put('/turnos/cancelar');
export const historialTurnos = () => API.get('/turnos/historial');
export const actualizarPerfil = (datos) => API.put('/auth/perfil', datos);
export const obtenerPerfil = () => API.get('/auth/perfil');
export const obtenerServicios = () => API.get('/servicios');
export const obtenerVentanillas = () => API.get('/servicios/ventanillas');
export const verTodosTurnos = () => API.get('/admin/turnos');
export const actualizarEstado = (id, estado, ventanilla_id) => API.put(`/admin/turnos/${id}/estado`, { estado, ventanilla_id });
export const verFila = () => API.get('/admin/fila');
export const obtenerEstadisticasAdmin = () => API.get('/admin/estadisticas');
export const miVentanilla = () => API.get('/cajero/ventanilla');
export const obtenerCajeros = () => API.get('/admin/cajeros');
export const crearCajero = (datos) => API.post('/admin/cajeros', datos);
export const toggleVentanilla = (id) => API.put(`/admin/ventanillas/${id}/toggle`);
export const miFilaCajero = () => API.get('/cajero/fila');
export const llamarSiguiente = () => API.post('/cajero/llamar');
export const finalizarTurno = () => API.put('/cajero/finalizar');