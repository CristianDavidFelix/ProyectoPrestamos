require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const paymentRoutes = require('./routes/paymentRoutes');
const { connectDB } = require('../config/db');
const { register, metricsMiddleware } = require('./middlewares/metrics'); // Métricas de Prometheus

const app = express();

// Middleware de métricas (debe ir antes de otros middlewares)
app.use(metricsMiddleware);

// Middleware
const corsOptions = {
  origin: ['http://localhost:3001'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
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
    service: 'pagos',
    timestamp: new Date().toISOString() 
  });
});

// Rutas
app.use('/api/pagos', paymentRoutes);

// Conectar a la base de datos
connectDB();

// Puerto de escucha
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`✅ Microservicio de Pagos en el puerto ${PORT}`));
