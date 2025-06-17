#!/bin/bash
# Script para generar reportes de coverage

set -e
echo "📊 Generating coverage reports..."

COVERAGE_DIR="coverage-reports"
mkdir -p $COVERAGE_DIR

# Función para generar coverage del frontend
generate_frontend_coverage() {
    echo "🎨 Generating frontend coverage..."
    
    cd frontend-plataforma
    
    # Ejecutar tests con coverage
    npm test -- --coverage --watchAll=false
    
    # Copiar reporte
    cp -r coverage/* ../$COVERAGE_DIR/frontend/ 2>/dev/null || mkdir -p ../$COVERAGE_DIR/frontend
    cp coverage/lcov.info ../$COVERAGE_DIR/frontend/ 2>/dev/null || echo "No lcov.info found"
    
    echo "✅ Frontend coverage generated"
    cd ..
}

# Función para generar coverage del backend
generate_backend_coverage() {
    echo "🐳 Generating backend coverage..."
    
    services=("usuarios" "prestamos" "pagos")
    
    for service in "${services[@]}"; do
        echo "📦 Generating coverage for $service..."
        
        cd backend/$service
        
        # Ejecutar tests con coverage
        npm test -- --coverage || echo "⚠️ Tests failed for $service"
        
        # Crear directorio y copiar reportes
        mkdir -p ../../$COVERAGE_DIR/backend/$service
        cp -r coverage/* ../../$COVERAGE_DIR/backend/$service/ 2>/dev/null || echo "No coverage for $service"
        
        cd ../..
    done
    
    echo "✅ Backend coverage generated"
}

# Función para combinar reportes
combine_coverage_reports() {
    echo "🔗 Combining coverage reports..."
    
    # Instalar herramienta para combinar reportes si es necesario
    if ! command -v lcov &> /dev/null; then
        echo "⚠️ lcov not installed, skipping combined report"
        return
    fi
    
    # Combinar reportes LCOV
    find $COVERAGE_DIR -name "lcov.info" -exec cat {} \; > $COVERAGE_DIR/combined-lcov.info
    
    # Generar reporte HTML combinado
    genhtml $COVERAGE_DIR/combined-lcov.info --output-directory $COVERAGE_DIR/combined-html
    
    echo "✅ Combined coverage report generated"
}

# Función para subir a servicios externos
upload_coverage() {
    echo "☁️ Uploading coverage reports..."
    
    # Codecov
    if [ -n "$CODECOV_TOKEN" ]; then
        echo "📤 Uploading to Codecov..."
        curl -s https://codecov.io/bash | bash -s -- -t "$CODECOV_TOKEN" || echo "⚠️ Codecov upload failed"
    fi
    
    # SonarCloud (opcional)
    if [ -n "$SONAR_TOKEN" ]; then
        echo "📤 Uploading to SonarCloud..."
        # sonar-scanner commands here
    fi
}

# Ejecutar generación de coverage
echo "🚀 Starting coverage generation..."

generate_frontend_coverage
generate_backend_coverage
combine_coverage_reports
upload_coverage

echo "📋 Coverage Summary:"
echo "📁 Reports location: $COVERAGE_DIR"
echo "🌐 View combined report: $COVERAGE_DIR/combined-html/index.html"
echo "🎉 Coverage generation completed!"