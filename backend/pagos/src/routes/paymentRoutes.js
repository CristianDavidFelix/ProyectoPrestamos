const express = require('express');
const { processPayment, getAllPaymentsHistory } = require('../controllers/paymentController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Cliente paga una cuota
router.post('/realizar', authenticate, processPayment); 

// Admin ve historial de pagos
router.get('/historial', authenticate, getAllPaymentsHistory);

module.exports = router;
