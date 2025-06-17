const client = require('prom-client');

// Crear un registro para las métricas
const register = new client.Registry();

// Habilitar métricas por defecto (CPU, memoria, etc.)
client.collectDefaultMetrics({ register });

// Métricas personalizadas para el microservicio de usuarios
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

const userRegistrations = new client.Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['service']
});

const userLogins = new client.Counter({
  name: 'user_logins_total',
  help: 'Total number of user login attempts',
  labelNames: ['service', 'status']
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
register.registerMetric(userRegistrations);
register.registerMetric(userLogins);
register.registerMetric(databaseQueryDuration);

// Middleware para medir duración de requests HTTP
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  const serviceName = 'usuarios';
  
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

// Función para incrementar registros de usuarios
const incrementUserRegistration = () => {
  userRegistrations.inc({ service: 'usuarios' });
};

// Función para incrementar logins de usuarios
const incrementUserLogin = (status) => {
  userLogins.inc({ service: 'usuarios', status });
};

// Función para medir duración de queries de BD
const measureDatabaseQuery = (operation) => {
  const end = databaseQueryDuration.startTimer({ operation, service: 'usuarios' });
  return end;
};

// Función para actualizar estado del pool de conexiones
const updateDatabasePool = (total, idle, active) => {
  databaseConnectionsPool.set({ service: 'usuarios', state: 'total' }, total);
  databaseConnectionsPool.set({ service: 'usuarios', state: 'idle' }, idle);
  databaseConnectionsPool.set({ service: 'usuarios', state: 'active' }, active);
};

module.exports = {
  register,
  metricsMiddleware,
  incrementUserRegistration,
  incrementUserLogin,
  measureDatabaseQuery,
  updateDatabasePool
};
