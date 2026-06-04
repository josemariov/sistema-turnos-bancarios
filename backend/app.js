const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const turnoRoutes = require('./src/routes/turnoRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const servicioRoutes = require('./src/routes/servicioRoutes');
const cajeroRoutes = require('./src/routes/cajeroRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/cajero', cajeroRoutes);

app.get('/', (req, res) => {
    res.json({ mensaje: 'API de turnos virtuales funcionando!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;