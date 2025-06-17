#!/bin/bash
# Script de verificación de salud de servicios

set -e
echo "🔍 Starting health check..."

# Configuración
MAX_RETRIES=5
RETRY_INTERVAL=10
TIMEOUT=30

# URLs de servicios (ajustar según tu configuración)
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3000"}
USUARIOS_URL=${USUARIOS_URL:-"http://localhost:3004"}
PRESTAMOS_URL=${PRESTAMOS_URL:-"http://localhost:3003"}
PAGOS_URL=${PAGOS_URL:-"http://localhost:3002"}

# Función para verificar un servicio
check_service() {
    local service_name=$1
    local service_url=$2
    local health_endpoint=${3:-"/health"}
    
    echo "🔍 Checking $service_name at $service_url$health_endpoint"
    
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -f -s --max-time $TIMEOUT "$service_url$health_endpoint" > /dev/null; then
            echo "✅ $service_name is healthy"
            return 0
        else
            echo "⚠️ $service_name check failed (attempt $i/$MAX_RETRIES)"
            if [ $i -lt $MAX_RETRIES ]; then
                sleep $RETRY_INTERVAL
            fi
        fi
    done
    
    echo "❌ $service_name is unhealthy after $MAX_RETRIES attempts"
    return 1
}

# Función para verificar base de datos
check_database() {
    echo "🐘 Checking database connection..."
    
    if command -v psql &> /dev/null; then
        if psql -h ${PGHOST:-localhost} -U ${PGUSER:-postgres} -d ${PGDATABASE:-postgres} -c "SELECT 1;" > /dev/null 2>&1; then
            echo "✅ Database is accessible"
            return 0
        else
            echo "❌ Database is not accessible"
            return 1
        fi
    else
        echo "⚠️ psql not available, skipping database check"
        return 0
    fi
}

# Función para verificar dependencias externas
check_external_dependencies() {
    echo "🌐 Checking external dependencies..."
    
    # Verificar conectividad a internet
    if curl -f -s --max-time 10 "https://google.com" > /dev/null; then
        echo "✅ Internet connectivity OK"
    else
        echo "⚠️ Internet connectivity issues"
    fi
    
    # Verificar servicios externos específicos si los tienes
    # check_service "External API" "https://api.external-service.com" "/status"
}

# Ejecutar verificaciones
echo "🚀 Starting comprehensive health check..."

HEALTH_STATUS=0

# Verificar base de datos
check_database || HEALTH_STATUS=1

# Verificar servicios backend
check_service "Usuarios Service" "$USUARIOS_URL" "/health" || HEALTH_STATUS=1
check_service "Prestamos Service" "$PRESTAMOS_URL" "/health" || HEALTH_STATUS=1
check_service "Pagos Service" "$PAGOS_URL" "/health" || HEALTH_STATUS=1

# Verificar frontend
check_service "Frontend" "$FRONTEND_URL" "/api/health" || HEALTH_STATUS=1

# Verificar dependencias externas
check_external_dependencies

# Resultado final
if [ $HEALTH_STATUS -eq 0 ]; then
    echo "🎉 All services are healthy!"
    exit 0
else
    echo "❌ Some services are unhealthy!"
    exit 1
fi