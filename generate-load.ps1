# Script para generar carga de prueba en los microservicios
param(
    [int]$requests = 50,
    [int]$delayMs = 200,
    [string[]]$services = @("3000", "3002", "3003")
)

Write-Host "🚀 Generando carga de prueba..." -ForegroundColor Green
Write-Host "Requests por servicio: $requests" -ForegroundColor Yellow
Write-Host "Delay entre requests: $delayMs ms" -ForegroundColor Yellow
Write-Host ""

$totalRequests = 0
$successfulRequests = 0
$errorRequests = 0

foreach ($port in $services) {
    $serviceName = switch ($port) {
        "3000" { "Usuarios" }
        "3002" { "Préstamos" } 
        "3003" { "Pagos" }
        default { "Puerto $port" }
    }
    
    Write-Host "📊 Probando servicio: $serviceName (puerto $port)" -ForegroundColor Cyan
    
    for ($i = 1; $i -le $requests; $i++) {
        $totalRequests++
        
        try {
            # Probar endpoint de health
            $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -TimeoutSec 5
            $successfulRequests++
            
            if ($i % 10 -eq 0) {
                Write-Host "  ✅ $i/$requests requests completados" -ForegroundColor Green
            }
            
        } catch {
            $errorRequests++
            if ($i % 10 -eq 0) {
                Write-Host "  ❌ Error en request $i`: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        # Delay entre requests
        if ($i -lt $requests) {
            Start-Sleep -Milliseconds $delayMs
        }
    }
    
    Write-Host ""
}

# Generar algunos requests a endpoints específicos si están disponibles
Write-Host "🎯 Probando endpoints específicos..." -ForegroundColor Cyan

$specificEndpoints = @(
    "http://localhost:9090/api/v1/query?query=up",
    "http://localhost:9090/api/v1/targets",
    "http://localhost:9093/api/v1/status"
)

foreach ($endpoint in $specificEndpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 5
        Write-Host "  ✅ $endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $endpoint - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📈 Resumen de la prueba:" -ForegroundColor Magenta
Write-Host "Total de requests: $totalRequests" -ForegroundColor White
Write-Host "Exitosos: $successfulRequests" -ForegroundColor Green
Write-Host "Errores: $errorRequests" -ForegroundColor Red
Write-Host "Tasa de éxito: $([math]::Round(($successfulRequests/$totalRequests)*100, 2))%" -ForegroundColor Yellow

Write-Host ""
Write-Host "💡 Ahora puedes ir a Prometheus (http://localhost:9090) y ejecutar:" -ForegroundColor Cyan
Write-Host "   - rate(http_requests_total[5m])" -ForegroundColor White
Write-Host "   - histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))" -ForegroundColor White
Write-Host "   - active_connections" -ForegroundColor White
