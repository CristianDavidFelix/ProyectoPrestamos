// src/models/userModel.js

const { pool } = require('../../config/db');

// CREAR USUARIO
const createUser = async (nombre, email, hashedPassword, rolId, fechaNacimiento, direccion) => {
    const query = `
        INSERT INTO usuarios (nombre, email, password, rol_id, fecha_nacimiento, direccion, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [nombre, email, hashedPassword, rolId, fechaNacimiento, direccion, false];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// OBTENER USUARIO POR EMAIL
const getUserByEmail = async (email) => {
    const query = `
        SELECT u.*, r.nombre AS rol_nombre
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        WHERE u.email = $1;
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

// OBTENER ID DE ROL POR NOMBRE
const getRoleIdByName = async (roleName) => {
    const query = 'SELECT id FROM roles WHERE nombre = $1';
    const result = await pool.query(query, [roleName]);
    return result.rows[0]?.id || null;
};

// CREAR DATOS FINANCIEROS
const createFinancialData = async (usuarioId, ingresosMensuales, numeroCuenta) => {
    const query = `
        INSERT INTO datos_financieros (usuario_id, ingresos_mensuales, numero_cuenta)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [usuarioId, ingresosMensuales, numeroCuenta];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// CREAR HISTORIAL CREDITICIO
const insertCreditHistory = async (usuarioId, descripcion, puntaje) => {
    const query = `
        INSERT INTO historial_crediticio (usuario_id, descripcion, puntaje_crediticio)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [usuarioId, descripcion, puntaje];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// OBTENER DATOS FINANCIEROS POR USUARIO
const getFinancialDataByUserId = async (usuarioId) => {
    const query = `
        SELECT ingresos_mensuales, numero_cuenta
        FROM datos_financieros
        WHERE usuario_id = $1;
    `;
    const result = await pool.query(query, [usuarioId]);
    return result.rows[0];
};

// OBTENER HISTORIAL CREDITICIO POR USUARIO
const getCreditHistoryByUserId = async (usuarioId) => {
    const query = `
        SELECT id, fecha, descripcion, puntaje_crediticio
        FROM historial_crediticio
        WHERE usuario_id = $1
        ORDER BY fecha DESC;
    `;
    const result = await pool.query(query, [usuarioId]);
    return result.rows;
};

module.exports = {
    createUser,
    getUserByEmail,
    getRoleIdByName,
    createFinancialData,
    insertCreditHistory,
    getFinancialDataByUserId,
    getCreditHistoryByUserId
};
