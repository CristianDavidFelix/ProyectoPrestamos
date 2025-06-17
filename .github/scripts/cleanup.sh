#!/bin/bash
# Script de limpieza de recursos

set -e
echo "🧹 Starting cleanup process..."

# Función para limpiar artifacts de CI
cleanup_ci_artifacts() {
    echo "📦 Cleaning CI artifacts..."
    
    # Limpiar node_modules temporales
    find . -name "node_modules" -type d -path "*/tmp/*" -exec rm -rf {} + 2>/dev/null || true
    
    # Limpiar logs temporales
    find . -name "*.log" -path "*/tmp/*" -delete 2>/dev/null || true
    
    # Limpiar coverage temporales
    find . -name "coverage" -type d -path "*/tmp/*" -exec rm -rf {} + 2>/dev/null || true
    
    echo "✅ CI artifacts cleaned"
}

# Función para limpiar contenedores Docker
cleanup_docker() {
    if command -v docker &> /dev/null; then
        echo "🐳 Cleaning Docker resources..."
        
        # Remover contenedores parados
        docker container prune -f 2>/dev/null || echo "⚠️ No containers to clean"
        
        # Remover imágenes sin tag
        docker image prune -f 2>/dev/null || echo "⚠️ No images to clean"
        
        # Remover volúmenes no utilizados
        docker volume prune -f 2>/dev/null || echo "⚠️ No volumes to clean"
        
        echo "✅ Docker resources cleaned"
    else
        echo "⚠️ Docker not available, skipping Docker cleanup"
    fi
}

# Función para limpiar bases de datos de testing
cleanup_test_databases() {
    echo "🐘 Cleaning test databases..."
    
    if command -v psql &> /dev/null; then
        # Remover bases de datos de testing
        dropdb test_usuarios 2>/dev/null || echo "test_usuarios not found"
        dropdb test_prestamos 2>/dev/null || echo "test_prestamos not found"
        dropdb test_pagos 2>/dev/null || echo "test_pagos not found"
        dropdb integration_test 2>/dev/null || echo "integration_test not found"
        
        echo "✅ Test databases cleaned"
    else
        echo "⚠️ psql not available, skipping database cleanup"
    fi
}

# Función para limpiar archivos temporales
cleanup_temp_files() {
    echo "📁 Cleaning temporary files..."
    
    # Limpiar archivos de coverage
    find . -name "coverage" -type d -not -path "./node_modules/*" -exec rm -rf {} + 2>/dev/null || true
    
    # Limpiar archivos .nyc_output
    find . -name ".nyc_output" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Limpiar archivos de Jest
    find . -name "jest_*" -delete 2>/dev/null || true
    
    # Limpiar logs
    find . -name "*.log" -not -path "./node_modules/*" -delete 2>/dev/null || true
    
    echo "✅ Temporary files cleaned"
}

# Ejecutar limpieza según parámetros
CLEANUP_TYPE=${1:-"all"}

case $CLEANUP_TYPE in
    "ci")
        cleanup_ci_artifacts
        ;;
    "docker")
        cleanup_docker
        ;;
    "db")
        cleanup_test_databases
        ;;
    "temp")
        cleanup_temp_files
        ;;
    "all")
        cleanup_ci_artifacts
        cleanup_docker
        cleanup_test_databases
        cleanup_temp_files
        ;;
    *)
        echo "❌ Unknown cleanup type: $CLEANUP_TYPE"
        echo "Available options: ci, docker, db, temp, all"
        exit 1
        ;;
esac

echo "🎉 Cleanup completed!"