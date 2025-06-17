const {
    registerUser,
    loginUser,
    getUserProfile,
    createFinancialData,
    addCreditHistory,
    getFinancialData,
    getCreditHistory,
    getAllUsers
} = require('../src/controllers/userController');

const {
    createUser,
    getUserByEmail,
    getRoleIdByName,
    createFinancialData: createFinancialDataModel,
    insertCreditHistory,
    getFinancialDataByUserId,
    getCreditHistoryByUserId
} = require('../src/models/userModel');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Mock de las dependencias
jest.mock('../src/models/userModel');
jest.mock('../src/services/emailService');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../config/db');

describe('registerUser', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                nombre: 'Test User',
                email: 'test@example.com',
                password: 'Password123!',
                fechaNacimiento: '1990-01-01',
                direccion: 'Test Address'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('debe registrar un usuario correctamente', async () => {
        getUserByEmail.mockResolvedValue(null);
        getRoleIdByName.mockResolvedValue(2);
        bcrypt.hash.mockResolvedValue('hashedPassword');
        createUser.mockResolvedValue({
            id: 1,
            nombre: 'Test User',
            email: 'test@example.com',
            fecha_nacimiento: '1990-01-01',
            direccion: 'Test Address'
        });
        jwt.sign.mockReturnValue('verification-token');

        await registerUser(req, res);

        expect(getUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(createUser).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Usuario registrado. Verifica tu correo electrónico.'
            })
        );
    });

    test('debe rechazar registro con email duplicado', async () => {
        getUserByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'El correo ya está registrado'
        });
    });
});

describe('loginUser', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'Password123!'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('debe iniciar sesión correctamente', async () => {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            password: 'hashedPassword',
            nombre: 'Test User',
            rol_nombre: 'cliente'
        };

        getUserByEmail.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('auth-token');

        await loginUser(req, res);

        expect(getUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashedPassword');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Inicio de sesión exitoso',
                token: 'auth-token'
            })
        );
    });

    test('debe rechazar credenciales incorrectas', async () => {
        getUserByEmail.mockResolvedValue(null);

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Credenciales incorrectas'
        });
    });
});

describe('getUserProfile', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { usuarioId: '1' },
            user: { id: 1, rol: 'administrador' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('debe obtener perfil de usuario para administrador', async () => {
        const mockFinancialData = { ingresos_mensuales: 5000, numero_cuenta: '123456' };
        const mockCreditHistory = [{ id: 1, descripcion: 'Buen historial', puntaje_crediticio: 750 }];

        getFinancialDataByUserId.mockResolvedValue(mockFinancialData);
        getCreditHistoryByUserId.mockResolvedValue(mockCreditHistory);

        await getUserProfile(req, res);

        expect(getFinancialDataByUserId).toHaveBeenCalledWith('1');
        expect(getCreditHistoryByUserId).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            financial_data: mockFinancialData,
            credit_history: mockCreditHistory
        });
    });

    test('debe rechazar acceso no autorizado', async () => {
        req.user = { id: 2, rol: 'cliente' };

        await getUserProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'No tienes permiso para ver este perfil'
        });
    });
});

describe('createFinancialData', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                usuarioId: 1,
                ingresosMensuales: 5000,
                numeroCuenta: '123456789'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('debe crear datos financieros correctamente', async () => {
        const mockFinancialData = {
            id: 1,
            usuario_id: 1,
            ingresos_mensuales: 5000,
            numero_cuenta: '123456789'
        };

        createFinancialDataModel.mockResolvedValue(mockFinancialData);

        await createFinancialData(req, res);

        expect(createFinancialDataModel).toHaveBeenCalledWith(1, 5000, '123456789');
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Datos financieros creados',
            financialData: mockFinancialData
        });
    });
});

describe('getAllUsers', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { rol: 'administrador' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('debe obtener todos los usuarios para administrador', async () => {
        const mockUsers = [
            { id: 1, nombre: 'Usuario 1', email: 'user1@test.com' },
            { id: 2, nombre: 'Usuario 2', email: 'user2@test.com' }
        ];

        pool.query.mockResolvedValue({ rows: mockUsers, rowCount: 2 });

        await getAllUsers(req, res);

        expect(pool.query).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test('debe rechazar acceso a no administradores', async () => {
        req.user.rol = 'cliente';

        await getAllUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'No tienes permiso para ver esta información'
        });
    });
});