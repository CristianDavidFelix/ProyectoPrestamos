const client = require('prom-client');

// Crear un registro para las métricas
const register = new client.Registry();

// Habilitar métricas por defecto (CPU, memoria, etc.)
client.collectDefaultMetrics({ register });

// Métricas personalizadas para el microservicio de pagos
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

const paymentsProcessed = new client.Counter({
  name: 'payments_processed_total',
  help: 'Total number of payments processed',
  labelNames: ['service', 'status', 'payment_type']
});

const paymentAmount = new client.Histogram({
  name: 'payment_amount',
  help: 'Amount of payments processed',
  labelNames: ['service', 'payment_type'],
  buckets: [10, 50, 100, 500, 1000, 5000, 10000]
});

const paymentProcessingTime = new client.Histogram({
  name: 'payment_processing_duration_seconds',
  help: 'Time taken to process payments',
  labelNames: ['service', 'payment_type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
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
register.registerMetric(paymentsProcessed);
register.registerMetric(paymentAmount);
register.registerMetric(paymentProcessingTime);
register.registerMetric(databaseQueryDuration);

// Middleware para medir duración de requests HTTP
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  const serviceName = 'pagos';
  
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

// Función para registrar pagos procesados
const recordPaymentProcessed = (status, paymentType, amount) => {
  paymentsProcessed.inc({ service: 'pagos', status, payment_type: paymentType });
  if (amount) {
    paymentAmount.observe({ service: 'pagos', payment_type: paymentType }, amount);
  }
};

// Función para medir tiempo de procesamiento de pagos
const measurePaymentProcessing = (paymentType) => {
  const end = paymentProcessingTime.startTimer({ service: 'pagos', payment_type: paymentType });
  return end;
};

// Función para medir duración de queries de BD
const measureDatabaseQuery = (operation) => {
  const end = databaseQueryDuration.startTimer({ operation, service: 'pagos' });
  return end;
};

// Función para actualizar estado del pool de conexiones
const updateDatabasePool = (total, idle, active) => {
  databaseConnectionsPool.set({ service: 'pagos', state: 'total' }, total);
  databaseConnectionsPool.set({ service: 'pagos', state: 'idle' }, idle);
  databaseConnectionsPool.set({ service: 'pagos', state: 'active' }, active);
};

module.exports = {
  register,
  metricsMiddleware,
  recordPaymentProcessed,
  measurePaymentProcessing,
  measureDatabaseQuery,
  updateDatabasePool
};
