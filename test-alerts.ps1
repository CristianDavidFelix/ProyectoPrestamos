# Script para probar alertas del sistema
Write-Host "🚨 Script de prueba de alertas del sistema de monitoreo" -ForegroundColor Red
Write-Host ""

function Send-TestAlert {
    param($alertName, $severity, $summary, $description)
    
    $alertData = @{
        "alerts" = @(
            @{
                "labels" = @{
                    "alertname" = $alertName
                    "service" = "test-service"
                    "severity" = $severity
                    "instance" = "localhost:9999"
                }
                "annotations" = @{
                    "summary" = $summary
                    "description" = $description
                }
                "startsAt" = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                "generatorURL" = "http://localhost:9090/graph"
            }
        )
    } | ConvertTo-Json -Depth 4

    try {
        $response = Invoke-RestMethod -Uri "http://localhost:9093/api/v1/alerts" -Method POST -Body $alertData -ContentType "application/json"
        Write-Host "✅ Alerta '$alertName' enviada correctamente" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Error enviando alerta '$alertName': $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Prueba 1: Alerta de advertencia
Write-Host "📤 Enviando alerta de advertencia..." -ForegroundColor Yellow
Send-TestAlert -alertName "HighLatencyTest" -severity "warning" -summary "Alta latencia detectada" -description "Latencia de prueba superior a 2 segundos"

Start-Sleep -Seconds 2

# Prueba 2: Alerta crítica
Write-Host "📤 Enviando alerta crítica..." -ForegroundColor Red
Send-TestAlert -alertName "ServiceDownTest" -severity "critical" -summary "Servicio caído" -description "Servicio de prueba no responde"

Start-Sleep -Seconds 2

# Prueba 3: Alerta de negocio
Write-Host "📤 Enviando alerta de negocio..." -ForegroundColor Magenta
Send-TestAlert -alertName "HighPaymentFailures" -severity "critical" -summary "Muchos pagos fallidos" -description "Tasa de pagos fallidos superior al 20%"

Write-Host ""
Write-Host "🎯 Ahora puedes verificar las alertas en:" -ForegroundColor Cyan
Write-Host "AlertManager: http://localhost:9093/#/alerts" -ForegroundColor White

Write-Host ""
Write-Host "⏰ Las alertas deberían aparecer en unos segundos..." -ForegroundColor Yellow

# Verificar que AlertManager esté funcionando
Write-Host ""
Write-Host "🔍 Verificando estado de AlertManager..." -ForegroundColor Cyan
try {
    $status = Invoke-RestMethod -Uri "http://localhost:9093/api/v1/status" -TimeoutSec 5
    Write-Host "✅ AlertManager está funcionando correctamente" -ForegroundColor Green
    Write-Host "Versión: $($status.data.versionInfo.version)" -ForegroundColor White
    Write-Host "Uptime: $($status.data.uptime)" -ForegroundColor White
} catch {
    Write-Host "❌ Error conectando con AlertManager: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Comandos útiles para probar alertas reales:" -ForegroundColor Cyan
Write-Host "# Detener un servicio para activar ServiceDown:" -ForegroundColor White
Write-Host "docker stop node-exporter" -ForegroundColor Gray
Write-Host ""
Write-Host "# Reiniciar después de la prueba:" -ForegroundColor White  
Write-Host "docker start node-exporter" -ForegroundColor Gray
Write-Host ""
Write-Host "# Consumir CPU para activar HighCPUUsage:" -ForegroundColor White
Write-Host "# En Linux/WSL: stress --cpu 8 --timeout 60s" -ForegroundColor Gray
