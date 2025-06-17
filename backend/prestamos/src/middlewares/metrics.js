const client = require('prom-client');

// Crear un registro para las métricas
const register = new client.Registry();

// Habilitar métricas por defecto (CPU, memoria, etc.)
client.collectDefaultMetrics({ register });

// Métricas personalizadas para el microservicio de préstamos
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service']
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['service']
});

const databaseConnectionsPool = new client.Gauge({
  name: 'database_connections_pool',
  help: 'Number of database connections in pool',
  labelNames: ['service', 'state']
});

const loansCreated = new client.Counter({
  name: 'loans_created_total',
  help: 'Total number of loans created',
  labelNames: ['service', 'loan_type', 'status']
});

const loanAmount = new client.Histogram({
  name: 'loan_amount',
  help: 'Amount of loans processed',
  labelNames: ['service', 'loan_type'],
  buckets: [1000, 5000, 10000, 50000, 100000, 500000, 1000000]
});

const loanProcessingTime = new client.Histogram({
  name: 'loan_processing_duration_seconds',
  help: 'Time taken to process loan applications',
  labelNames: ['service', 'loan_type'],
  buckets: [1, 5, 10, 30, 60, 300, 600]
});

const activeLoans = new client.Gauge({
  name: 'active_loans_total',
  help: 'Number of currently active loans',
  labelNames: ['service', 'loan_type']
});

const overdueLoans = new client.Gauge({
  name: 'overdue_loans_total',
  help: 'Number of overdue loans',
  labelNames: ['service', 'days_overdue']
});

const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'service'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});

// Registrar métricas
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseConnectionsPool);
register.registerMetric(loansCreated);
register.registerMetric(loanAmount);
register.registerMetric(loanProcessingTime);
register.registerMetric(activeLoans);
register.registerMetric(overdueLoans);
register.registerMetric(databaseQueryDuration);

// Middleware para medir duración de requests HTTP
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  const serviceName = 'prestamos';
  
  // Incrementar conexiones activas
  activeConnections.inc({ service: serviceName });
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    // Registrar duración del request
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString(), serviceName)
      .observe(duration);
    
    // Incrementar contador de requests
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString(), serviceName)
      .inc();
    
    // Decrementar conexiones activas
    activeConnections.dec({ service: serviceName });
  });
  
  next();
};

// Función para registrar préstamos creados
const recordLoanCreated = (loanType, status, amount) => {
  loansCreated.inc({ service: 'prestamos', loan_type: loanType, status });
  if (amount) {
    loanAmount.observe({ service: 'prestamos', loan_type: loanType }, amount);
  }
};

// Función para medir tiempo de procesamiento de préstamos
const measureLoanProcessing = (loanType) => {
  const end = loanProcessingTime.startTimer({ service: 'prestamos', loan_type: loanType });
  return end;
};

// Función para actualizar préstamos activos
const updateActiveLoans = (loanType, count) => {
  activeLoans.set({ service: 'prestamos', loan_type: loanType }, count);
};

// Función para actualizar préstamos vencidos
const updateOverdueLoans = (daysOverdue, count) => {
  overdueLoans.set({ service: 'prestamos', days_overdue: daysOverdue }, count);
};

// Función para medir duración de queries de BD
const measureDatabaseQuery = (operation) => {
  const end = databaseQueryDuration.startTimer({ operation, service: 'prestamos' });
  return end;
};

// Función para actualizar estado del pool de conexiones
const updateDatabasePool = (total, idle, active) => {
  databaseConnectionsPool.set({ service: 'prestamos', state: 'total' }, total);
  databaseConnectionsPool.set({ service: 'prestamos', state: 'idle' }, idle);
  databaseConnectionsPool.set({ service: 'prestamos', state: 'active' }, active);
};

module.exports = {
  register,
  metricsMiddleware,
  recordLoanCreated,
  measureLoanProcessing,
  updateActiveLoans,
  updateOverdueLoans,
  measureDatabaseQuery,
  updateDatabasePool
};
