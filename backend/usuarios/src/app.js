require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes'); // Rutas del microservicio
const culturalRoutes = require('./routes/culturalRoutes'); // Rutas culturales
const { connectDB } = require('../config/db');  // Configuración de la base de datos
const { register, metricsMiddleware } = require('./middlewares/metrics'); // Métricas de Prometheus
const { culturalMiddleware } = require('./middlewares/cultural'); // Middleware cultural

const app = express();

// Middleware de métricas (debe ir antes de otros middlewares)
app.use(metricsMiddleware);

// Middleware cultural para tracking intercultural
app.use(culturalMiddleware);

// Middleware
const corsOptions = {
  origin: ['http://localhost:3001'], // Agrega los orígenes de confianza
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Especifica los métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'], // Agregar Accept-Language
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

// Endpoint para métricas de Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    service: 'usuarios',
    timestamp: new Date().toISOString() 
  });
});

// Rutas
app.use('/api/usuarios', userRoutes);
app.use('/api/cultural', culturalRoutes); // Rutas culturales

// Conectar a la base de datos
connectDB();

// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de Usuarios corriendo en el puerto ${PORT}`));