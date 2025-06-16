const { pool } = require('../../config/db');

const createLoan = async (usuarioId, monto, tasa, plazo, cuotaMensual, estado) => {
    const query = `
        INSERT INTO prestamos (usuario_id, monto, tasa, plazo, cuota_mensual, estado, fecha_inicio)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *;
    `;
    const values = [usuarioId, monto, tasa, plazo, cuotaMensual, estado];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const approveLoan = async (prestamoId) => {
    const query = `
        UPDATE prestamos
        SET estado = 'aprobado'
        WHERE id = $1 AND estado = 'pendiente_aprobacion'
        RETURNING *;
    `;
    const result = await pool.query(query, [prestamoId]);
    return result.rowCount > 0 ? result.rows[0] : null;
};

// ==========================
// 🚀 Rechazar préstamo
// ==========================
const rejectLoan = async (prestamoId) => {
    const query = `
        UPDATE prestamos
        SET estado = 'rechazado'
        WHERE id = $1 AND estado = 'pendiente_aprobacion'
        RETURNING *;
    `;
    const result = await pool.query(query, [prestamoId]);
    return result.rowCount > 0 ? result.rows[0] : null;
};

const getUserLoans = async (usuarioId) => {
    const query = `SELECT * FROM prestamos WHERE usuario_id = $1;`;
    const result = await pool.query(query, [usuarioId]);
    return result.rows;
};

const hasActiveLoan = async (usuarioId) => {
    const query = `SELECT COUNT(*) FROM prestamos WHERE usuario_id = $1 AND estado = 'pendiente';`;
    const result = await pool.query(query, [usuarioId]);
    return result.rows[0].count > 0;
};

const hasLoanAwaitingApproval = async (usuarioId) => {
    const query = `SELECT COUNT(*) FROM prestamos WHERE usuario_id = $1 AND estado = 'pendiente_aprobacion';`;
    const result = await pool.query(query, [usuarioId]);
    return result.rows[0].count > 0;
};

const generateAmortization = async (prestamoId, monto, tasa, plazo) => {
    try {
        const tasaMensual = parseFloat(tasa) / 100 / 12;
        const cuotaMensual = monto * tasaMensual / (1 - Math.pow(1 + tasaMensual, -plazo));
        let saldoRestante = parseFloat(monto);

        for (let i = 1; i <= plazo; i++) {
            // Si es la última cuota, ajustar para que el saldo restante no sea negativo
            let cuotaFinal = i === plazo ? saldoRestante : cuotaMensual;

            saldoRestante -= cuotaFinal;

            const query = `
                INSERT INTO amortizacion (prestamo_id, numero_cuota, monto_cuota, saldo_restante, fecha_pago, estado)
                VALUES ($1, $2::INTEGER, $3::NUMERIC(10,2), $4::NUMERIC(10,2), NOW() + INTERVAL '1 month' * $2, 'pendiente');
            `;

            await pool.query(query, [
                parseInt(prestamoId, 10),  
                parseInt(i, 10),  
                parseFloat(cuotaFinal.toFixed(2)),  
                parseFloat(Math.max(0, saldoRestante).toFixed(2)) // Evitar saldo negativo
            ]);
        }

        console.log(`✅ Tabla de amortización generada para préstamo ID ${prestamoId}`);
    } catch (error) {
        console.error("❌ Error al generar la tabla de amortización:", error.message);
        throw new Error("Error en la generación de amortización.");
    }
};


const isLoanFullyPaid = async (prestamoId) => {
    const query = `
        SELECT COUNT(*) AS cuotas_pendientes
        FROM amortizacion
        WHERE prestamo_id = $1 AND estado = 'pendiente';
    `;
    const result = await pool.query(query, [prestamoId]);

    return parseInt(result.rows[0].cuotas_pendientes) === 0; // Si no hay cuotas pendientes, está pagado
};

const getLoanByIdFromDB = async (id) => {
    const query = "SELECT * FROM prestamos WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const updateAmortizationTable = async (prestamoId) => {
    try {
        // Marcar la próxima cuota como pagada
        const query = `
            UPDATE amortizacion 
            SET estado = 'pagado'
            WHERE id = (
                SELECT id FROM amortizacion 
                WHERE prestamo_id = $1 AND estado = 'pendiente'
                ORDER BY numero_cuota ASC 
                LIMIT 1
            )
            RETURNING *;
        `;
        const result = await pool.query(query, [prestamoId]);

        if (result.rowCount === 0) {
            return { message: "No hay cuotas pendientes para este préstamo." };
        }

        // Verificar si todas las cuotas han sido pagadas
        const isFullyPaidQuery = `
            SELECT COUNT(*) AS cuotas_pendientes
            FROM amortizacion
            WHERE prestamo_id = $1 AND estado = 'pendiente';
        `;
        const pendingResult = await pool.query(isFullyPaidQuery, [prestamoId]);

        if (parseInt(pendingResult.rows[0].cuotas_pendientes) === 0) {
            // Si no hay cuotas pendientes, marcar el préstamo como pagado
            const updateLoanQuery = `
                UPDATE prestamos
                SET estado = 'pagado'
                WHERE id = $1
                RETURNING *;
            `;
            await pool.query(updateLoanQuery, [prestamoId]);

            return { message: "Préstamo completamente pagado." };
        }

        return { message: "Cuota pagada con éxito." };
    } catch (error) {
        console.error("❌ Error al actualizar la tabla de amortización:", error.message);
        throw error;
    }
};



module.exports = { createLoan, getUserLoans, hasActiveLoan, hasLoanAwaitingApproval, approveLoan, rejectLoan, generateAmortization, isLoanFullyPaid, getLoanByIdFromDB, updateAmortizationTable};
