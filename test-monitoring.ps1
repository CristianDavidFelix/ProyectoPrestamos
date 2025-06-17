# Script de pruebas para el sistema de monitoreo
Write-Host "🧪 Iniciando pruebas del sistema de monitoreo..." -ForegroundColor Green
Write-Host ""

# Función para probar URL
function Test-Service {
    param($name, $url)
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 5
        Write-Host "✅ $name`: OK (Status: $($response.StatusCode))" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $name`: Error - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Verificar servicios de monitoreo
Write-Host "📊 Verificando servicios de monitoreo:" -ForegroundColor Cyan
$services = @(
    @{name="Prometheus"; url="http://localhost:9090/-/healthy"},
    @{name="AlertManager"; url="http://localhost:9093/-/healthy"}, 
    @{name="Grafana"; url="http://localhost:3030/api/health"},
    @{name="Node Exporter"; url="http://localhost:9100/"},
    @{name="cAdvisor"; url="http://localhost:8081/healthz"}
)

$successCount = 0
foreach ($service in $services) {
    if (Test-Service $service.name $service.url) {
        $successCount++
    }
}

Write-Host ""
Write-Host "📈 Verificando endpoints de métricas:" -ForegroundColor Cyan

# Verificar endpoints de métricas
$metricsEndpoints = @(
    @{name="Prometheus Metrics"; url="http://localhost:9090/metrics"},
    @{name="Node Exporter Metrics"; url="http://localhost:9100/metrics"},
    @{name="PostgreSQL Exporter Metrics"; url="http://localhost:9187/metrics"}
)

foreach ($endpoint in $metricsEndpoints) {
    Test-Service $endpoint.name $endpoint.url | Out-Null
}

Write-Host ""
Write-Host "🚀 Verificando microservicios (si están corriendo):" -ForegroundColor Cyan

# Probar microservicios
$microservices = @(
    @{name="Usuarios"; port="3000"},
    @{name="Préstamos"; port="3002"},
    @{name="Pagos"; port="3003"}
)

foreach ($ms in $microservices) {
    Test-Service "$($ms.name) Health" "http://localhost:$($ms.port)/health" | Out-Null
    Test-Service "$($ms.name) Metrics" "http://localhost:$($ms.port)/metrics" | Out-Null
}

Write-Host ""
Write-Host "🎯 Generando tráfico de prueba..." -ForegroundColor Cyan

# Generar algunas requests de prueba
for ($i = 1; $i -le 10; $i++) {
    try {
        Invoke-WebRequest -Uri "http://localhost:9090/api/v1/query?query=up" -TimeoutSec 2 | Out-Null
        Write-Progress -Activity "Generando tráfico" -Status "Request $i/10" -PercentComplete (($i/10)*100)
    } catch {
        # Ignorar errores
    }
}

Write-Host ""
Write-Host "📊 URLs de acceso rápido:" -ForegroundColor Magenta
Write-Host "Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "AlertManager: http://localhost:9093" -ForegroundColor White
Write-Host "Grafana: http://localhost:3030 (admin/admin123)" -ForegroundColor White
Write-Host "Node Exporter: http://localhost:9100" -ForegroundColor White
Write-Host "cAdvisor: http://localhost:8081" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Pruebas completadas! Servicios funcionando: $successCount de $($services.Count)" -ForegroundColor Green
