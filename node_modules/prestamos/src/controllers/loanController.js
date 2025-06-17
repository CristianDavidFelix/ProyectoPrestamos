const { 
    createLoan, 
    getUserLoans, 
    hasActiveLoan, 
    hasLoanAwaitingApproval, 
    approveLoan, 
    rejectLoan, 
    generateAmortization,
    getLoanByIdFromDB,
    updateAmortizationTable
} = require('../models/loanModel');
const { calcularCuotaMensual } = require('../services/amortizationService');
const { pool } = require('../../config/db');

// ==========================
// 🚀 Solicitar un préstamo (CLIENTE)
// ==========================
const requestLoan = async (req, res) => {
    const usuarioId = req.user.id;
    const { monto, tasa, plazo } = req.body;

    try {
        if (req.user.rol !== "cliente") {
            return res.status(403).json({ error: "Solo los clientes pueden solicitar préstamos." });
        }

        if (await hasLoanAwaitingApproval(usuarioId)) {
            return res.status(400).json({ error: "Ya tienes un préstamo pendiente de aprobación." });
        }

        if (await hasActiveLoan(usuarioId)) {
            return res.status(400).json({ error: "Debes pagar tu préstamo actual antes de solicitar otro." });
        }

        const cuotaMensual = calcularCuotaMensual(monto, tasa, plazo);
        const newLoan = await createLoan(usuarioId, monto, tasa, plazo, cuotaMensual, "pendiente_aprobacion");

        res.status(201).json({ message: "Solicitud de préstamo enviada para aprobación.", prestamo: newLoan });
    } catch (error) {
        console.error("❌ Error en solicitud de préstamo:", error.message);
        res.status(500).json({ error: "Error en el servidor. Intente nuevamente." });
    }
};

// ==========================
// 🚀 Aprobar préstamo (ADMIN)
// ==========================
const approveLoanRequest = async (req, res) => {
    const { prestamoId } = req.body;

    try {
        if (req.user.rol !== "administrador") {
            return res.status(403).json({ error: "Solo los administradores pueden aprobar préstamos." });
        }

        const updatedLoan = await approveLoan(prestamoId);
        if (!updatedLoan) {
            return res.status(404).json({ error: "Préstamo no encontrado o ya aprobado." });
        }

        await generateAmortization(prestamoId, updatedLoan.monto, updatedLoan.tasa, updatedLoan.plazo);

        res.status(200).json({ message: "Préstamo aprobado con éxito.", prestamo: updatedLoan });
    } catch (error) {
        console.error("❌ Error al aprobar préstamo:", error.message);
        res.status(500).json({ error: "Error en el servidor." });
    }
};

// ==========================
// 🚀 Rechazar préstamo (ADMIN)
// ==========================
const rejectLoanRequest = async (req, res) => {
    const { prestamoId } = req.body;

    try {
        if (req.user.rol !== "administrador") {
            return res.status(403).json({ error: "Solo los administradores pueden rechazar préstamos." });
        }

        const rejectedLoan = await rejectLoan(prestamoId);
        if (!rejectedLoan) {
            return res.status(404).json({ error: "Préstamo no encontrado o ya gestionado." });
        }

        res.status(200).json({ message: "Préstamo rechazado.", prestamo: rejectedLoan });
    } catch (error) {
        console.error("❌ Error al rechazar préstamo:", error.message);
        res.status(500).json({ error: "Error en el servidor." });
    }
};

// ==========================
// 🚀 Obtener préstamos del usuario
// ==========================
const getLoans = async (req, res) => {
    try {
        let loans;
        if (req.user.rol === "administrador") {
            // Obtener préstamos pendientes de aprobación para el administrador
            const query = "SELECT * FROM prestamos WHERE estado = 'pendiente_aprobacion'";
            const result = await pool.query(query);
            loans = result.rows;
        } else {
            // Obtener préstamos del cliente
            loans = await getUserLoans(req.user.id);
        }

        if (loans.length === 0) {
            return res.status(404).json({
                message: req.user.rol === "administrador"
                    ? "No hay préstamos pendientes de aprobación."
                    : "No tienes préstamos registrados."
            });
        }

        res.status(200).json(loans);
    } catch (error) {
        console.error("❌ Error al obtener préstamos:", error.message);
        res.status(500).json({ error: "Error al obtener préstamos." });
    }
};

const getAmortizationByLoanId = async (req, res) => {
    const { prestamoId } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM amortizacion WHERE prestamo_id = $1",
            [prestamoId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "No hay amortización registrada para este préstamo." });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("❌ Error al obtener amortización:", error.message);
        res.status(500).json({ error: "Error en el servidor." });
    }
};

const getLoanById = async (req, res) => {
    const { id } = req.params;

    try {
        const loan = await getLoanByIdFromDB(id);
        if (!loan) {
            return res.status(404).json({ error: "Préstamo no encontrado" });
        }
        res.status(200).json(loan);
    } catch (error) {
        console.error("❌ Error al obtener préstamo:", error.message);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

const updateAmortization = async (req, res) => {
    const { prestamoId } = req.body;

    try {
        const result = await updateAmortizationTable(prestamoId);
        if (!result) {
            return res.status(404).json({ error: "No hay cuotas pendientes para este préstamo." });
        }

        res.status(200).json({ message: "Amortización actualizada.", amortizacion: result });
    } catch (error) {
        console.error("❌ Error al actualizar la amortización en préstamos:", error.message);
        res.status(500).json({ error: "Error interno en el microservicio de préstamos." });
    }
};

const updateLoanAmortization = async (req, res) => {
    const { prestamoId } = req.body;

    try {
        const result = await updateAmortizationTable(prestamoId);

        res.status(200).json({ message: result.message });
    } catch (error) {
        console.error("❌ Error al actualizar la amortización en préstamos:", error.message);
        res.status(500).json({ error: "Error en el servidor." });
    }
};


module.exports = { requestLoan, approveLoanRequest, rejectLoanRequest, getLoans, getAmortizationByLoanId, getLoanById, updateAmortization, updateLoanAmortization};
