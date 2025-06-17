require('dotenv').config();
const express = require('express');
const cors = require('cors');

const loanRoutes = require('./routes/loanRoutes');
const { connectDB } = require('../config/db');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000', // Frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use('/api/prestamos', loanRoutes);

connectDB();

// Puerto correcto: 3002
app.listen(3002, () => console.log('Microservicio de Préstamos en el puerto 3002'));