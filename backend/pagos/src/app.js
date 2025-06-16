require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const paymentRoutes = require('./routes/paymentRoutes');
const { connectDB } = require('../config/db');

const app = express();

// Middleware
const corsOptions = {
  origin: ['http://localhost:3001'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

// Rutas
app.use('/api/pagos', paymentRoutes);

// Conectar a la base de datos
connectDB();

// Puerto de escucha
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`✅ Microservicio de Pagos en el puerto ${PORT}`));
