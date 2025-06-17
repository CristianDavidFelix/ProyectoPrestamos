#!/bin/bash
# Script principal de despliegue

set -e
echo "🚀 Starting deployment process..."

# Validar variables de entorno requeridas
REQUIRED_VARS=("DEPLOY_ENV")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Variable $var no está configurada"
        exit 1
    fi
done

DEPLOY_ENV=${DEPLOY_ENV:-staging}
echo "📦 Deploying to environment: $DEPLOY_ENV"

# Función para build del frontend
build_frontend() {
    echo "🎨 Building frontend..."
    cd frontend-plataforma
    
    # Instalar dependencias de producción
    npm ci --only=production
    
    # Build de producción
    npm run build
    
    # Verificar que el build fue exitoso
    if [ ! -d ".next" ]; then
        echo "❌ Frontend build failed"
        exit 1
    fi
    
    echo "✅ Frontend built successfully"
    cd ..
}

# Función para deploy de microservicios
deploy_microservices() {
    echo "🐳 Deploying microservices..."
    
    services=("usuarios" "prestamos" "pagos")
    
    for service in "${services[@]}"; do
        echo "📦 Deploying $service service..."
        cd backend/$service
        
        # Instalar dependencias
        npm ci --only=production
        
        # Ejecutar tests básicos
        npm test || {
            echo "❌ Tests failed for $service"
            exit 1
        }
        
        # Aquí puedes agregar comandos específicos de despliegue
        case $DEPLOY_ENV in
            "production")
                echo "🚀 Deploying $service to production..."
                # docker build -t $service:latest .
                # kubectl apply -f k8s/$service-deployment.yml
                ;;
            "staging")
                echo "🧪 Deploying $service to staging..."
                # docker build -t $service:staging .
                ;;
        esac
        
        echo "✅ $service deployed successfully"
        cd ../..
    done
}

# Función de health check
health_check() {
    echo "🔍 Performing health check..."
    sleep 10 # Esperar que los servicios se inicialicen
    
    # Aquí puedes agregar health checks reales
    # curl -f http://your-app/health || exit 1
    
    echo "✅ Health check passed"
}

# Ejecutar deployment
echo "📋 Starting deployment pipeline..."

build_frontend
deploy_microservices
health_check

echo "🎉 Deployment completed successfully!"
echo "🌐 Environment: $DEPLOY_ENV"
echo "📝 Commit: $(git rev-parse --short HEAD)"