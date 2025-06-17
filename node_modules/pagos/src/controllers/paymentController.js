const { registerPayment, getUserPayments } = require('../models/paymentModel');
const { updateAmortizationTable } = require('../../../prestamos/src/models/loanModel');
const axios = require('axios');

const processPayment = async (req, res) => {
    const usuarioId = req.user.id;
    const { prestamoId, monto } = req.body;

    try {
        // Obtener la información del préstamo
        const loanResponse = await axios.get(`http://localhost:3002/api/prestamos/${prestamoId}`, {
            headers: { Authorization: req.headers.authorization }
        });

        if (!loanResponse.data) {
            return res.status(404).json({ error: "Préstamo no encontrado o no te pertenece." });
        }

        if (loanResponse.data.estado === "pagado") {
            return res.status(400).json({ error: "Este préstamo ya ha sido completamente pagado." });
        }

        const cuota = parseFloat(loanResponse.data.cuota_mensual);

        // 🔹 Si el monto pagado es mayor a la cuota
        if (monto > cuota) {
            const cambio = monto - cuota; // Se calcula el cambio

            // Registrar el pago solo por el monto de la cuota
            await registerPayment(usuarioId, prestamoId, cuota);

            // Actualizar amortización en el microservicio de préstamos
            const amortizationResponse = await axios.put(
                `http://localhost:3002/api/prestamos/actualizarAmortizacion`,
                { prestamoId },
                { headers: { Authorization: req.headers.authorization } }
            );

            return res.status(200).json({ 
                message: `Se abonó ${cuota.toFixed(2)} USD a la cuota. Su cambio es de ${cambio.toFixed(2)} USD.`,
                amortizacion: amortizationResponse.data.message 
            });
        }

        // 🔹 Si el monto pagado es exactamente igual a la cuota
        if (monto === cuota) {
            await registerPayment(usuarioId, prestamoId, monto);

            // Actualizar amortización
            const amortizationResponse = await axios.put(
                `http://localhost:3002/api/prestamos/actualizarAmortizacion`,
                { prestamoId },
                { headers: { Authorization: req.headers.authorization } }
            );

            return res.status(200).json({ message: amortizationResponse.data.message });
        }

        // 🔹 Si el monto es menor a la cuota (rechazar el pago)
        return res.status(400).json({ error: `El monto ingresado es menor a la cuota mensual de ${cuota.toFixed(2)} USD.` });

    } catch (error) {
        console.error("❌ Error al procesar el pago:", error.message);
        res.status(500).json({ error: "Error en el servidor." });
    }
};



const getAllPaymentsHistory = async (req, res) => {
    if (req.user.rol !== "administrador") {
        return res.status(403).json({ error: "Solo los administradores pueden ver el historial de pagos." });
    }

    try {
        const payments = await getUserPayments();

        // Transformar los datos antes de enviarlos
        const formattedPayments = payments.map(payment => ({
            id: payment.id,
            usuario: payment.usuario, // Ahora es el ID del usuario
            monto: parseFloat(payment.monto),
            fecha_pago: payment.fecha_pago
        }));

        res.status(200).json(formattedPayments);
    } catch (error) {
        console.error("❌ Error al obtener historial de pagos:", error.message);
        res.status(500).json({ error: "Error al obtener el historial de pagos" });
    }
};

module.exports = { processPayment, getAllPaymentsHistory };
