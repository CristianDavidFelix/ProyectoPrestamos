#!/bin/bash
set -e

echo "🐘 Setting up test databases..."

# Variables de entorno para testing (actualizadas con tu configuración)
export PGUSER=${PGUSER:-postgres}
export PGPASSWORD=${PGPASSWORD:-lol123}
export PGHOST=${PGHOST:-localhost}

# Función para crear base de datos si no existe
create_db_if_not_exists() {
    local db_name=$1
    local port=${2:-5432}
    
    echo "📊 Creating database $db_name on port $port..."
    
    PGPORT=$port createdb $db_name 2>/dev/null || echo "✅ Database $db_name already exists"
    
    # Crear esquemas básicos según tu estructura real
    case $db_name in
        "usuarios")
            echo "🔧 Setting up usuarios schema..."
            PGPORT=$port psql -d $db_name -c "
                -- Crear la tabla de roles
                CREATE TABLE IF NOT EXISTS roles (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(50) UNIQUE NOT NULL CHECK (nombre IN ('administrador', 'cliente'))
                );

                -- Insertar roles por defecto
                INSERT INTO roles (nombre) VALUES ('administrador'), ('cliente')
                ON CONFLICT (nombre) DO NOTHING;

                -- Crear la tabla de usuarios (estructura actualizada según tu código)
                CREATE TABLE IF NOT EXISTS usuarios (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    rol_id INT REFERENCES roles(id),
                    is_verified BOOLEAN DEFAULT FALSE,
                    direccion TEXT,
                    fecha_nacimiento DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                -- Tabla de datos financieros (Solo administradores pueden agregar/modificar)
                CREATE TABLE IF NOT EXISTS datos_financieros (
                    id SERIAL PRIMARY KEY,
                    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                    ingresos_mensuales NUMERIC(10, 2),
                    numero_cuenta VARCHAR(20)
                );

                -- Tabla de historial crediticio (Solo administradores pueden agregar/modificar)
                CREATE TABLE IF NOT EXISTS historial_crediticio (
                    id SERIAL PRIMARY KEY,
                    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                    fecha DATE DEFAULT CURRENT_DATE,
                    descripcion TEXT,
                    puntaje_crediticio INT
                );

                -- Insertar usuario de prueba para testing
                INSERT INTO usuarios (nombre, email, password, rol_id, direccion) VALUES 
                    ('Admin Test', 'admin@test.com', '\$2b\$10\$dummyhashedpassword', 1, 'Calle Test 123'),
                    ('Cliente Test', 'cliente@test.com', '\$2b\$10\$dummyhashedpassword', 2, 'Avenida Test 456')
                ON CONFLICT (email) DO NOTHING;
            " 2>/dev/null || echo "⚠️ Schema creation skipped for usuarios"
            ;;
            
        "prestamos")
            echo "🔧 Setting up prestamos schema..."
            PGPORT=$port psql -d $db_name -c "
                -- Tabla de préstamos (estructura según tu código)
                CREATE TABLE IF NOT EXISTS prestamos (
                    id SERIAL PRIMARY KEY,
                    usuario_id INT NOT NULL,
                    monto DECIMAL(10,2) NOT NULL,
                    tasa DECIMAL(5,2) NOT NULL,
                    plazo INT NOT NULL,
                    cuota_mensual DECIMAL(10,2) NOT NULL,
                    estado VARCHAR(50) DEFAULT 'pendiente_aprobacion',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                -- Tabla de amortización
                CREATE TABLE IF NOT EXISTS amortizacion (
                    id SERIAL PRIMARY KEY,
                    prestamo_id INT NOT NULL,
                    numero_cuota INT NOT NULL,
                    monto_cuota DECIMAL(10,2) NOT NULL,
                    saldo_restante DECIMAL(10,2) NOT NULL,
                    fecha_pago DATE NOT NULL,
                    estado VARCHAR(20) DEFAULT 'pendiente'
                );

                -- Insertar datos de prueba
                INSERT INTO prestamos (usuario_id, monto, tasa, plazo, cuota_mensual) VALUES 
                    (1, 5000000.00, 15.50, 12, 476923.08),
                    (2, 2000000.00, 18.00, 24, 98765.43)
                ON CONFLICT DO NOTHING;
            " 2>/dev/null || echo "⚠️ Schema creation skipped for prestamos"
            ;;
            
        "pagos_db")
            echo "🔧 Setting up pagos_db schema..."
            PGPORT=$port psql -d $db_name -c "
                -- Tabla de pagos (estructura según tu código)
                CREATE TABLE IF NOT EXISTS pagos (
                    id SERIAL PRIMARY KEY,
                    usuario_id INT NOT NULL,
                    prestamo_id INT NOT NULL,
                    monto NUMERIC(10,2) NOT NULL,
                    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                -- Insertar datos de prueba
                INSERT INTO pagos (usuario_id, prestamo_id, monto) VALUES 
                    (1, 1, 476923.08),
                    (2, 2, 98765.43)
                ON CONFLICT DO NOTHING;
            " 2>/dev/null || echo "⚠️ Schema creation skipped for pagos_db"
            ;;
            
        "integration_test")
            echo "🔧 Setting up integration_test schema..."
            PGPORT=$port psql -d $db_name -c "
                CREATE TABLE IF NOT EXISTS test_scenarios (
                    id SERIAL PRIMARY KEY,
                    scenario_name VARCHAR(100),
                    test_data JSONB,
                    expected_result JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            " 2>/dev/null || echo "⚠️ Schema creation skipped for integration_test"
            ;;
    esac
}

# Verificar si PostgreSQL está disponible
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client (psql) no está instalado"
    echo "💡 En GitHub Actions, esto se maneja automáticamente"
    exit 0
fi

echo "🔧 PostgreSQL client encontrado, procediendo con setup..."

# Crear bases de datos
create_db_if_not_exists "usuarios" 5432
create_db_if_not_exists "prestamos" 5433  
create_db_if_not_exists "pagos_db" 5434
create_db_if_not_exists "integration_test" 5435

echo "🎉 Test environment setup completed!"