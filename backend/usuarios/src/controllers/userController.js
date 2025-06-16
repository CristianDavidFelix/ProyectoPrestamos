// src/controllers/userController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');
const { sendConfirmationEmail } = require('../services/emailService');
const { 
    createUser, 
    createFinancialData, 
    insertCreditHistory,
    getFinancialDataByUserId,
    getCreditHistoryByUserId,
    getUserByEmail,
    getRoleIdByName
} = require('../models/userModel');

// REGISTRO DE USUARIO CON CORREO DE CONFIRMACIÓN
const registerUser = async (req, res) => {
    const {
        nombre, email, password,
        fechaNacimiento, direccion,
        rol = 'cliente'
    } = req.body;

    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        const roleId = await getRoleIdByName(rol);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await createUser(
            nombre, email, hashedPassword,
            roleId, fechaNacimiento, direccion
        );

        // Generar token de verificación
        const verificationToken = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        const verificationLink = `http://localhost:3000/api/usuarios/verify?token=${verificationToken}`;

        // Enviar correo
        await sendConfirmationEmail(email, nombre, verificationLink, password);

        res.status(201).json({
            message: 'Usuario registrado. Verifica tu correo electrónico.',
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                email: newUser.email,
                fecha_nacimiento: newUser.fecha_nacimiento,
                direccion: newUser.direccion,
                rol
            }
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
};

// PERFIL DE USUARIO
const getUserProfile = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        // Si no es administrador, solo puede ver su propio perfil
        if (req.user.rol !== 'administrador' && req.user.id !== usuarioId) {
            return res.status(403).json({ error: 'No tienes permiso para ver este perfil' });
        }

        // Obtener datos financieros y historial crediticio
        const financialData = await getFinancialDataByUserId(usuarioId);
        const creditHistory = await getCreditHistoryByUserId(usuarioId);

        // Verificar si se encontraron datos
        if (!financialData && !creditHistory) {
            return res.status(404).json({ error: 'No se encontraron datos para este usuario' });
        }

        res.status(200).json({
            financial_data: financialData || {},
            credit_history: creditHistory || []
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error.message);
        res.status(500).json({ error: 'Error al obtener el perfil' });
    }
};

// OBTENER DATOS FINANCIEROS
const getFinancialData = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        // Verificar permisos
        if (req.user.rol !== 'administrador' && req.user.id !== usuarioId && req.user.rol !== 'cliente') {
            return res.status(403).json({ error: 'No tienes permiso para ver estos datos' });
        }

        const financialData = await getFinancialDataByUserId(usuarioId);
        if (!financialData) {
            return res.status(404).json({ error: 'No se encontraron datos financieros' });
        }

        res.status(200).json(financialData);
    } catch (error) {
        console.error('Error al obtener datos financieros:', error.message);
        res.status(500).json({ error: 'Error al obtener datos financieros' });
    }
};

// OBTENER HISTORIAL CREDITICIO
const getCreditHistory = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        // Verificar permisos
        if ( req.user.rol !== 'administrador' && req.user.id !== usuarioId && req.user.rol !== 'cliente') {
            return res.status(403).json({ error: 'No tienes permiso para ver este historial' });
        }

        const creditHistory = await getCreditHistoryByUserId(usuarioId);
        if (!creditHistory) {
            return res.status(404).json({ error: 'No se encontró historial crediticio' });
        }

        res.status(200).json(creditHistory);
    } catch (error) {
        console.error('Error al obtener historial crediticio:', error.message);
        res.status(500).json({ error: 'Error al obtener historial crediticio' });
    }
};

// OBTENER TODOS LOS USUARIOS
const getAllUsers = async (req, res) => {
    try {
        // Verificar que el usuario sea administrador
        if (req.user.rol !== 'administrador') {
            return res.status(403).json({ error: 'No tienes permiso para ver esta información' });
        }

        // Consulta modificada para obtener más información
        const result = await pool.query(`
            SELECT 
                u.id,
                u.nombre,
                u.apellido,
                u.email
            FROM usuarios u
            INNER JOIN roles r ON u.rol_id = r.id
            WHERE r.nombre = 'cliente'
            AND u.is_verified = true
            ORDER BY u.nombre ASC
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No hay usuarios registrados' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

// CREAR DATOS FINANCIEROS (ADMIN)
const createFinancialDataHandler = async (req, res) => {
    const { usuarioId, ingresosMensuales, numeroCuenta } = req.body;
    try {
        const financialData = await createFinancialData(usuarioId, ingresosMensuales, numeroCuenta);
        res.status(201).json({ message: 'Datos financieros creados', financialData });
    } catch (error) {
        console.error('Error al crear datos financieros:', error.message);
        res.status(500).json({ error: 'Error al crear datos financieros' });
    }
};

// AGREGAR HISTORIAL CREDITICIO (ADMIN)
const addCreditHistoryHandler = async (req, res) => {
    const { usuarioId, descripcion, puntaje } = req.body;
    try {
        const creditHistory = await insertCreditHistory(usuarioId, descripcion, puntaje);
        res.status(201).json({ message: 'Historial crediticio agregado', creditHistory });
    } catch (error) {
        console.error('Error al agregar historial crediticio:', error.message);
        res.status(500).json({ error: 'Error al agregar historial crediticio' });
    }
};

// ==========================
// INICIO DE SESIÓN (LOGIN)
// ==========================
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
        }

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol_nombre },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol_nombre
            }
        });
    } catch (error) {
        console.error('Error en el login:', error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// ==========================
// VERIFICACIÓN DE CORREO (GET /verify)
// ==========================
const verifyUser = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send(`
            <html>
                <h2 style="color:red;">❌ Error: Token no proporcionado</h2>
            </html>
        `);
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { email } = decoded;

        // Actualizar el campo is_verified en la base de datos
        const result = await pool.query(
            'UPDATE usuarios SET is_verified = TRUE WHERE email = $1 AND is_verified = FALSE RETURNING *',
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(400).send(`
                <html>
                    <h2 style="color:red;">❌ Error: El correo ya fue verificado o el usuario no existe.</h2>
                </html>
            `);
        }

        res.status(200).send(`
            <html>
                <h2 style="color:green;">✅ Verificación Exitosa</h2>
                <p>Tu cuenta ha sido activada. Ya puedes iniciar sesión.</p>
            </html>
        `);
    } catch (error) {
        console.error('Error en la verificación:', error.message);
        return res.status(400).send(`
            <html>
                <h2 style="color:red;">❌ Error: Enlace de verificación inválido o expirado</h2>
                <p>Solicita un nuevo correo de verificación.</p>
            </html>
        `);
    }
};



module.exports = {
    registerUser,
    getUserProfile,
    createFinancialData: createFinancialDataHandler,
    addCreditHistory: addCreditHistoryHandler,
    loginUser,
    verifyUser,
    getFinancialData,
    getCreditHistory,
    getAllUsers
};
