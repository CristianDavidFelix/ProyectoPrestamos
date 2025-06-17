require('dotenv').config();
const express = require('express');
const cors = require('cors');

const loanRoutes = require('./routes/loanRoutes');
const { connectDB } = require('../config/db');
const { register, metricsMiddleware } = require('./middlewares/metrics'); // Métricas de Prometheus

const app = express();

// Middleware de métricas (debe ir antes de otros middlewares)
app.use(metricsMiddleware);

const corsOptions = {
  origin: 'http://localhost:3001', // URL única del frontend
  credentials: true, // Habilitar credenciales
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware para manejar preflight OPTIONS
app.options('*', cors(corsOptions));

app.use(express.json());

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
    service: 'prestamos',
    timestamp: new Date().toISOString() 
  });
});

// Middleware para verificar headers de autorización
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use('/api/prestamos', loanRoutes);

connectDB();

app.listen(3002, () => console.log('Microservicio de Préstamos en el puerto 3002'));