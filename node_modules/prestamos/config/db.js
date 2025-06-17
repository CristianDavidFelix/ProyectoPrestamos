require('dotenv').config(); // 🔹 Cargar variables de entorno
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: String(process.env.POSTGRES_PASSWORD), // 🔹 Convertir a string
    port: process.env.POSTGRES_PORT || 5432,
});

const connectDB = async () => {
    try {
        await pool.connect();
        console.log('✅ Conectado a PostgreSQL - Préstamos');
    } catch (error) {
        console.error('❌ Error al conectar:', error.message);
        process.exit(1);
    }
};

module.exports = { pool, connectDB };
