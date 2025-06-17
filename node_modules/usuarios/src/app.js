require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const { connectDB } = require('../config/db');

const app = express();

// Middleware - Frontend corre en puerto 3000
const corsOptions = {
  origin: ['http://localhost:3000'], // Frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Rutas
app.use('/api/usuarios', userRoutes);

// Conectar a la base de datos
connectDB();

// Puerto CORREGIDO: 3001 para usuarios
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor de Usuarios corriendo en el puerto ${PORT}`));