const { processPayment, getAllPaymentsHistory } = require('../src/controllers/paymentController');
const { registerPayment, getUserPayments } = require('../src/models/paymentModel');
const { updateAmortizationTable } = require('../../prestamos/src/models/loanModel');
const axios = require('axios');

// Mock de las dependencias
jest.mock('../src/models/paymentModel');
jest.mock('../../prestamos/src/models/loanModel');
jest.mock('axios');

describe('processPayment', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { id: '1' },
            body: { prestamoId: '100', monto: 200 },
            headers: { authorization: 'Bearer token' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('debe procesar el pago y dar cambio cuando el monto es mayor a la cuota', async () => {
        const cuota = 150;
        axios.get.mockResolvedValue({
            data: { estado: 'aprobado', cuota_mensual: cuota }
        });
        registerPayment.mockResolvedValue({ id: 1 });
        axios.put.mockResolvedValue({ data: { message: 'Cuota pagada con éxito.' } });

        await processPayment(req, res);

        expect(registerPayment).toHaveBeenCalledWith('1', '100', cuota);
        expect(axios.put).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: `Se abonó ${cuota.toFixed(2)} USD a la cuota. Su cambio es de ${(req.body.monto - cuota).toFixed(2)} USD.`,
            amortizacion: 'Cuota pagada con éxito.'
        });
    });

    test('debe procesar el pago cuando el monto es igual a la cuota', async () => {
        const cuota = 200;
        req.body.monto = cuota;

        axios.get.mockResolvedValue({
            data: { estado: 'aprobado', cuota_mensual: cuota }
        });
        registerPayment.mockResolvedValue({ id: 1 });
        axios.put.mockResolvedValue({ data: { message: 'Cuota pagada con éxito.' } });

        await processPayment(req, res);

        expect(registerPayment).toHaveBeenCalledWith('1', '100', cuota);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Cuota pagada con éxito.'
        });
    });

    test('debe rechazar el pago cuando el monto es menor a la cuota', async () => {
        const cuota = 250;
        req.body.monto = 200;

        axios.get.mockResolvedValue({
            data: { estado: 'aprobado', cuota_mensual: cuota }
        });

        await processPayment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: `El monto ingresado es menor a la cuota mensual de ${cuota.toFixed(2)} USD.`
        });
    });
});

describe('getAllPaymentsHistory', () => {
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

    test('debe retornar 403 si el usuario no es administrador', async () => {
        req.user.rol = 'cliente';

        await getAllPaymentsHistory(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "Solo los administradores pueden ver el historial de pagos."
        });
    });

    test('debe retornar la lista de pagos formateada para un administrador', async () => {
        const mockPayments = [
            { id: 1, usuario: '1', monto: '100.00', fecha_pago: '2023-01-01' },
            { id: 2, usuario: '2', monto: '200.00', fecha_pago: '2023-01-02' }
        ];
        getUserPayments.mockResolvedValue(mockPayments);

        await getAllPaymentsHistory(req, res);

        expect(getUserPayments).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            { id: 1, usuario: '1', monto: 100, fecha_pago: '2023-01-01' },
            { id: 2, usuario: '2', monto: 200, fecha_pago: '2023-01-02' }
        ]);
    });
});

