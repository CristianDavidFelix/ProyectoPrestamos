require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes'); // Rutas del microservicio
const { connectDB } = require('../config/db');  // Configuración de la base de datos

const app = express();

// Middleware
const corsOptions = {
  origin: ['http://localhost:3001'], // Agrega los orígenes de confianza
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Especifica los métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Define los encabezados permitidos
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

// Rutas
app.use('/api/usuarios', userRoutes);

// Conectar a la base de datos
connectDB();

// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de Usuarios corriendo en el puerto ${PORT}`));