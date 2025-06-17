# Script para instalar dependencias y iniciar el monitoreo

Write-Host "=== Instalando dependencias de Prometheus para todos los microservicios ===" -ForegroundColor Green

# Instalar dependencias para el microservicio de usuarios
Write-Host "Instalando dependencias para usuarios..." -ForegroundColor Yellow
Set-Location "backend\usuarios"
npm install
Set-Location "..\..\"

# Instalar dependencias para el microservicio de pagos  
Write-Host "Instalando dependencias para pagos..." -ForegroundColor Yellow
Set-Location "backend\pagos"
npm install
Set-Location "..\..\"

# Instalar dependencias para el microservicio de préstamos
Write-Host "Instalando dependencias para prestamos..." -ForegroundColor Yellow
Set-Location "backend\prestamos"
npm install
Set-Location "..\..\"

Write-Host "=== Iniciando stack de monitoreo con Docker Compose ===" -ForegroundColor Green
docker-compose -f docker-compose.monitoring.yml up -d

Write-Host "=== Esperando que los servicios se inicialicen ===" -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "=== URLs de acceso ===" -ForegroundColor Cyan
Write-Host "Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "AlertManager: http://localhost:9093" -ForegroundColor White  
Write-Host "Grafana: http://localhost:3030 (admin/admin123)" -ForegroundColor White
Write-Host "Node Exporter: http://localhost:9100" -ForegroundColor White
Write-Host "cAdvisor: http://localhost:8080" -ForegroundColor White

Write-Host "=== Para iniciar los microservicios ===" -ForegroundColor Magenta
Write-Host "Terminal 1: cd backend\usuarios && npm run dev" -ForegroundColor White
Write-Host "Terminal 2: cd backend\pagos && npm run dev" -ForegroundColor White
Write-Host "Terminal 3: cd backend\prestamos && npm run dev" -ForegroundColor White

Write-Host "=== Monitoreo configurado exitosamente! ===" -ForegroundColor Green
