const express = require('express');
const {
    registerUser,
    loginUser,
    verifyUser,
    getUserProfile,
    createFinancialData,
    addCreditHistory,
    getFinancialData,
    getCreditHistory,
    getAllUsers
} = require('../controllers/userController');

const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// ==========================
// RUTAS DE CLIENTES
// ==========================
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify', verifyUser);

// ==========================
// RUTAS DE PERFIL Y DATOS
// ==========================
router.get('/perfil/:usuarioId', authenticate, getUserProfile);
router.get('/:usuarioId/datos-financieros', authenticate, getFinancialData);
router.get('/:usuarioId/historial-crediticio', authenticate, getCreditHistory);

// ==========================
// RUTAS DE ADMINISTRADORES
// ==========================
router.get('/', authenticate, getAllUsers);
router.post('/financiero', authenticate, createFinancialData);
router.post('/crediticio', authenticate, addCreditHistory);

module.exports = router;