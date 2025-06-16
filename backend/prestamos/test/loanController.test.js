const {
  requestLoan,
  approveLoanRequest,
  rejectLoanRequest,
  getLoans,
  getAmortizationByLoanId,
  getLoanById,
  updateAmortization,
  updateLoanAmortization,
} = require("../src/controllers/loanController");

// Importar las dependencias necesarias para mockear
const {
  createLoan,
  getUserLoans,
  hasActiveLoan,
  hasLoanAwaitingApproval,
  approveLoan,
  rejectLoan,
  generateAmortization,
  getLoanByIdFromDB,
  updateAmortizationTable,
} = require("../src/models/loanModel");
const { calcularCuotaMensual } = require("../src/services/amortizationService");
const { pool } = require("../config/db");

// Mockear las dependencias
jest.mock("../src/models/loanModel");
jest.mock("../src/services/amortizationService");
jest.mock("../config/db");

describe("requestLoan", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "1", rol: "cliente" },
      body: { monto: 5000, tasa: 10, plazo: 12 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("debe rechazar si el usuario ya tiene un préstamo activo", async () => {
    hasLoanAwaitingApproval.mockResolvedValue(false);
    hasActiveLoan.mockResolvedValue(true);

    await requestLoan(req, res);

    expect(hasActiveLoan).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Debes pagar tu préstamo actual antes de solicitar otro.",
    });
  });

  test("debe crear el préstamo correctamente", async () => {
    hasLoanAwaitingApproval.mockResolvedValue(false);
    hasActiveLoan.mockResolvedValue(false);
    calcularCuotaMensual.mockReturnValue(439.58);
    createLoan.mockResolvedValue({
      id: "123",
      monto: 5000,
      tasa: 10,
      plazo: 12,
    });

    await requestLoan(req, res);

    expect(calcularCuotaMensual).toHaveBeenCalledWith(5000, 10, 12);
    expect(createLoan).toHaveBeenCalledWith(
      "1",
      5000,
      10,
      12,
      439.58,
      "pendiente_aprobacion"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Solicitud de préstamo enviada para aprobación.",
      prestamo: { id: "123", monto: 5000, tasa: 10, plazo: 12 },
    });
  });
});

describe("approveLoanRequest", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "1", rol: "administrador" },
      body: { prestamoId: "123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("debe aprobar el préstamo y generar la amortización", async () => {
    const mockLoan = { id: "123", monto: 5000, tasa: 10, plazo: 12 };
    approveLoan.mockResolvedValue(mockLoan);
    generateAmortization.mockResolvedValue(true);

    await approveLoanRequest(req, res);

    expect(approveLoan).toHaveBeenCalledWith("123");
    expect(generateAmortization).toHaveBeenCalledWith("123", 5000, 10, 12);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Préstamo aprobado con éxito.",
      prestamo: mockLoan,
    });
  });
});

describe("rejectLoanRequest", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "1", rol: "administrador" },
      body: { prestamoId: "123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("debe rechazar el préstamo correctamente", async () => {
    const mockLoan = { id: "123", estado: "rechazado" };
    rejectLoan.mockResolvedValue(mockLoan);

    await rejectLoanRequest(req, res);

    expect(rejectLoan).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Préstamo rechazado.",
      prestamo: mockLoan,
    });
  });
});

describe("getAmortizationByLoanId", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { prestamoId: "123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("debe retornar la amortización del préstamo", async () => {
    const mockAmortizacion = [
      {
        id: "1",
        numero_cuota: 1,
        monto_cuota: 439.58,
        saldo_restante: 4600.42,
        estado: "pendiente",
      },
    ];
    pool.query.mockResolvedValue({ rows: mockAmortizacion, rowCount: 1 });

    await getAmortizationByLoanId(req, res);

    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM amortizacion WHERE prestamo_id = $1",
      ["123"]
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAmortizacion);
  });
});

describe("getLoanById", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: "123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("debe retornar el préstamo solicitado", async () => {
    const mockLoan = { id: "123", monto: 5000, tasa: 10, plazo: 12 };
    getLoanByIdFromDB.mockResolvedValue(mockLoan);

    await getLoanById(req, res);

    expect(getLoanByIdFromDB).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockLoan);
  });
});

describe("updateAmortization", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { prestamoId: "123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("debe actualizar la amortización correctamente", async () => {
    const mockResult = { message: "Cuota pagada con éxito." };
    updateAmortizationTable.mockResolvedValue(mockResult);

    await updateAmortization(req, res);

    expect(updateAmortizationTable).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Amortización actualizada.",
      amortizacion: mockResult,
    });
  });

  test("debe manejar caso sin cuotas pendientes", async () => {
    updateAmortizationTable.mockResolvedValue(null);

    await updateAmortization(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No hay cuotas pendientes para este préstamo.",
    });
  });
});

describe("updateLoanAmortization", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { prestamoId: "123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("debe actualizar la amortización y retornar el mensaje correcto", async () => {
    const mockResult = { message: "Préstamo completamente pagado." };
    updateAmortizationTable.mockResolvedValue(mockResult);

    await updateLoanAmortization(req, res);

    expect(updateAmortizationTable).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: mockResult.message,
    });
  });
});
