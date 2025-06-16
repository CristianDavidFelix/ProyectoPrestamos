require('dotenv').config();
const express = require('express');
const cors = require('cors');

const loanRoutes = require('./routes/loanRoutes');
const { connectDB } = require('../config/db');

const app = express();

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

// Middleware para verificar headers de autorización
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use('/api/prestamos', loanRoutes);

connectDB();

app.listen(3002, () => console.log('Microservicio de Préstamos en el puerto 3002'));