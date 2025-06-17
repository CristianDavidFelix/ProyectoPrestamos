const express = require('express');
const { requestLoan, getLoans, approveLoanRequest, rejectLoanRequest, getAmortizationByLoanId, getLoanById, updateAmortization} = require('../controllers/loanController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// ==========================
// 🚀 Rutas para Clientes
// ==========================
router.post('/solicitar', authenticate, requestLoan);
router.get('/', authenticate, getLoans);
router.get('/:id', authenticate, getLoanById);

// ==========================
// 🚀 Rutas para Administradores
// ==========================
router.put('/aprobar', authenticate, approveLoanRequest);
router.put('/rechazar', authenticate, rejectLoanRequest);
router.put('/actualizarAmortizacion', authenticate, updateAmortization);

// 🔹 Nueva ruta para obtener la amortización de un préstamo específico
router.get('/amortizacion/:prestamoId', authenticate, getAmortizationByLoanId);

// 🔹 Ruta para pagar una cuota
router.put('/amortizacion/:cuotaId/pagar', async (req, res) => {
    const { cuotaId } = req.params;

    try {
        const result = await pool.query(
            `UPDATE amortizacion SET estado = 'pagado' WHERE id = $1 RETURNING *`,
            [cuotaId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Cuota no encontrada o ya pagada.' });
        }

        res.status(200).json({ message: 'Cuota pagada exitosamente', cuota: result.rows[0] });
    } catch (error) {
        console.error('❌ Error al actualizar cuota:', error.message);
        res.status(500).json({ error: 'Error en el servidor.' });
    }
});

module.exports = router;
