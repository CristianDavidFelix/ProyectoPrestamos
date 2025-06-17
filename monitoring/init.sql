-- Script inicial para la base de datos de monitoreo
-- Este script se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear esquemas básicos si no existen
CREATE SCHEMA IF NOT EXISTS usuarios;
CREATE SCHEMA IF NOT EXISTS prestamos;
CREATE SCHEMA IF NOT EXISTS pagos;

-- Crear tablas básicas para el monitoreo (ejemplos)
CREATE TABLE IF NOT EXISTS usuarios.user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

CREATE TABLE IF NOT EXISTS prestamos.loan_status_log (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER,
    status VARCHAR(50),
    amount DECIMAL(12,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_by INTEGER
);

CREATE TABLE IF NOT EXISTS pagos.payment_transaction_log (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER,
    status VARCHAR(50),
    amount DECIMAL(12,2),
    payment_method VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_time_ms INTEGER
);

-- Crear índices para optimizar consultas de monitoreo
CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON usuarios.user_activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_loan_status_timestamp ON prestamos.loan_status_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_payment_transaction_timestamp ON pagos.payment_transaction_log(timestamp);

-- Insertar algunos datos de ejemplo para testing (opcional)
INSERT INTO usuarios.user_activity_log (user_id, action, ip_address, user_agent) VALUES
(1, 'login', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'register', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'logout', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

INSERT INTO prestamos.loan_status_log (loan_id, status, amount, processed_by) VALUES
(1, 'approved', 50000.00, 1),
(2, 'pending', 25000.00, 1),
(3, 'rejected', 75000.00, 2);

INSERT INTO pagos.payment_transaction_log (payment_id, status, amount, payment_method, processing_time_ms) VALUES
(1, 'completed', 1500.00, 'credit_card', 450),
(2, 'failed', 2000.00, 'bank_transfer', 1200),
(3, 'completed', 800.00, 'debit_card', 320);

-- Mensaje de confirmación
SELECT 'Base de datos de monitoreo inicializada correctamente' as mensaje;
