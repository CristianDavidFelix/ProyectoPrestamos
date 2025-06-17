# Script para detener el stack de monitoreo

Write-Host "=== Deteniendo stack de monitoreo ===" -ForegroundColor Yellow
docker-compose -f docker-compose.monitoring.yml down

Write-Host "=== Limpiando volúmenes (opcional) ===" -ForegroundColor Yellow
$cleanup = Read-Host "¿Deseas eliminar los volúmenes de datos? (y/N)"
if ($cleanup -eq "y" -or $cleanup -eq "Y") {
    docker-compose -f docker-compose.monitoring.yml down -v
    Write-Host "Volúmenes eliminados" -ForegroundColor Green
}

Write-Host "=== Stack de monitoreo detenido ===" -ForegroundColor Green
