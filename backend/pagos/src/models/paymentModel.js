const { pool } = require('../../config/db');

const registerPayment = async (usuarioId, prestamoId, monto) => {
    const query = `
        INSERT INTO pagos (usuario_id, prestamo_id, monto, fecha_pago)
        VALUES ($1, $2, $3, NOW())
            RETURNING *;
    `;
    const values = [usuarioId, prestamoId, monto];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getUserPayments = async () => {
    const query = `
        SELECT id, usuario_id as usuario, monto, fecha_pago
        FROM pagos
        ORDER BY fecha_pago DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
};

module.exports = { registerPayment, getUserPayments };