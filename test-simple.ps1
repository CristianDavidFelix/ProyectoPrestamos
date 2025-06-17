# Script de pruebas simple para el sistema de monitoreo
Write-Host "Iniciando pruebas del sistema de monitoreo..." -ForegroundColor Green

# URLs a probar
$urls = @(
    "http://localhost:9090",
    "http://localhost:9093", 
    "http://localhost:3030",
    "http://localhost:9100",
    "http://localhost:8081"
)

$nombres = @("Prometheus", "AlertManager", "Grafana", "Node Exporter", "cAdvisor")

$exitos = 0

for ($i = 0; $i -lt $urls.Length; $i++) {
    try {
        $response = Invoke-WebRequest -Uri $urls[$i] -TimeoutSec 5
        Write-Host "✅ $($nombres[$i]): OK" -ForegroundColor Green
        $exitos++
    } catch {
        Write-Host "❌ $($nombres[$i]): Error" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Resultados: $exitos de $($urls.Length) servicios funcionando" -ForegroundColor Cyan

Write-Host ""
Write-Host "URLs de acceso:" -ForegroundColor Yellow
Write-Host "Prometheus: http://localhost:9090"
Write-Host "AlertManager: http://localhost:9093"
Write-Host "Grafana: http://localhost:3030 (admin/admin123)"
Write-Host "Node Exporter: http://localhost:9100"
Write-Host "cAdvisor: http://localhost:8081"
