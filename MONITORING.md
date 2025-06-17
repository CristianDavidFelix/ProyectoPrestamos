# Monitoreo con Prometheus y AlertManager

Este proyecto implementa un sistema completo de monitoreo para la plataforma de préstamos usando Prometheus, AlertManager y Grafana.

## 🏗️ Arquitectura del Monitoreo

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Usuarios      │    │   Préstamos     │    │     Pagos       │
│   (puerto 3000) │    │   (puerto 3002) │    │   (puerto 3003) │
│   /metrics      │    │   /metrics      │    │   /metrics      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Prometheus    │
                    │   (puerto 9090) │
                    │                 │
                    │ - Scraping      │
                    │ - Alertas       │
                    │ - Métricas      │
                    └─────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
     ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
     │  AlertManager   │ │    Grafana      │ │ Node Exporter   │
     │  (puerto 9093)  │ │  (puerto 3030)  │ │  (puerto 9100)  │
     │                 │ │                 │ │                 │
     │ - Email         │ │ - Dashboards    │ │ - Métricas OS   │
     │ - Slack         │ │ - Visualización │ │                 │
     │ - Webhooks      │ │                 │ │                 │
     └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🚀 Inicio Rápido

### 1. Instalar y ejecutar el stack de monitoreo:
```powershell
.\start-monitoring.ps1
```

### 2. Iniciar los microservicios (en terminales separadas):
```bash
# Terminal 1 - Usuarios
cd backend\usuarios
npm run dev

# Terminal 2 - Pagos  
cd backend\pagos
npm run dev

# Terminal 3 - Préstamos
cd backend\prestamos
npm run dev
```

### 3. Acceder a las interfaces:
- **Prometheus**: http://localhost:9090
- **AlertManager**: http://localhost:9093  
- **Grafana**: http://localhost:3030 (admin/admin123)
- **Node Exporter**: http://localhost:9100
- **cAdvisor**: http://localhost:8080

## 📊 Métricas Implementadas

### Métricas HTTP Generales
- `http_requests_total`: Total de requests HTTP por método, ruta, código de estado y servicio
- `http_request_duration_seconds`: Duración de requests HTTP en percentiles
- `active_connections`: Número de conexiones activas por servicio

### Métricas de Sistema
- `node_cpu_seconds_total`: Uso de CPU del sistema
- `node_memory_*`: Métricas de memoria del sistema
- `node_filesystem_*`: Uso de disco del sistema
- `database_connections_pool`: Pool de conexiones de base de datos

### Métricas de Negocio

#### Servicio de Usuarios
- `user_registrations_total`: Total de registros de usuarios
- `user_logins_total`: Total de intentos de login (exitosos/fallidos)

#### Servicio de Pagos
- `payments_processed_total`: Total de pagos procesados por estado y tipo
- `payment_amount`: Distribución de montos de pagos
- `payment_processing_duration_seconds`: Tiempo de procesamiento de pagos

#### Servicio de Préstamos
- `loans_created_total`: Total de préstamos creados por tipo y estado
- `loan_amount`: Distribución de montos de préstamos
- `active_loans_total`: Número de préstamos activos
- `overdue_loans_total`: Número de préstamos vencidos
- `loan_processing_duration_seconds`: Tiempo de procesamiento de solicitudes

## 🚨 Alertas Configuradas

### Alertas de Infraestructura
- **ServiceDown**: Servicio caído por más de 30 segundos
- **HighLatency**: Latencia P95 > 2 segundos por más de 1 minuto
- **HighErrorRate**: Tasa de errores 5xx > 10% por más de 2 minutos
- **HighCPUUsage**: Uso de CPU > 80% por más de 2 minutos
- **HighMemoryUsage**: Uso de memoria > 80% por más de 2 minutos
- **LowDiskSpace**: Uso de disco > 80%

### Alertas de Negocio
- **HighPaymentFailureRate**: Tasa de pagos fallidos > 20% por más de 3 minutos
- **HighOverdueLoans**: Más de 100 préstamos vencidos por más de 5 minutos
- **HighUserRegistrationFailures**: Más de 5 fallos de login por segundo
- **HighActiveConnections**: Más de 100 conexiones activas por más de 1 minuto
- **SlowDatabaseQueries**: Queries P95 > 1 segundo por más de 2 minutos

## 🔧 Configuración de Notificaciones

### Email
Edita `monitoring/alertmanager.yml`:
```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'tu-email@gmail.com'
  smtp_auth_username: 'tu-email@gmail.com'
  smtp_auth_password: 'tu-app-password'
```

### Slack
Agrega tu webhook URL en `monitoring/alertmanager.yml`:
```yaml
slack_configs:
  - api_url: 'https://hooks.slack.com/services/TU_WEBHOOK_URL'
```

## 📈 Uso de Métricas en el Código

### Ejemplo en controladores:

```javascript
const { recordPaymentProcessed, measurePaymentProcessing } = require('../middlewares/metrics');

const processPayment = async (req, res) => {
  const endTimer = measurePaymentProcessing('credit_card');
  
  try {
    // Lógica de procesamiento
    const result = await paymentService.process(paymentData);
    
    recordPaymentProcessed('success', 'credit_card', amount);
    endTimer(); // Detiene el timer
    
    res.json(result);
  } catch (error) {
    recordPaymentProcessed('failed', 'credit_card', amount);
    endTimer();
    res.status(500).json({ error: error.message });
  }
};
```

## 🛠️ Comandos Útiles

### Verificar métricas de un servicio:
```bash
curl http://localhost:3000/metrics  # Usuarios
curl http://localhost:3002/metrics  # Préstamos
curl http://localhost:3003/metrics  # Pagos
```

### Consultas PromQL útiles:
```promql
# Tasa de requests por servicio
rate(http_requests_total[5m])

# Latencia P95 por servicio
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Servicios caídos
up == 0

# Tasa de errores
rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])
```

### Detener el stack:
```powershell
.\stop-monitoring.ps1
```

## 🔍 Troubleshooting

### Los servicios no aparecen en Prometheus:
1. Verifica que los microservicios estén ejecutándose
2. Verifica que el endpoint `/metrics` responda
3. Revisa los logs de Prometheus: `docker logs prometheus`

### Las alertas no llegan:
1. Verifica la configuración de email/Slack en `alertmanager.yml`
2. Prueba las alertas desde AlertManager UI
3. Revisa los logs: `docker logs alertmanager`

### Grafana no muestra datos:
1. Verifica que Prometheus esté funcionando
2. Revisa la configuración del datasource en Grafana
3. Importa manualmente el dashboard desde `monitoring/grafana/dashboards/`

## 📚 Recursos Adicionales

- [Documentación de Prometheus](https://prometheus.io/docs/)
- [Guía de AlertManager](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Dashboards de Grafana](https://grafana.com/grafana/dashboards/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)

---

**Nota**: Este sistema de monitoreo está configurado para desarrollo. Para producción, considera:
- Usar servicios externos (AWS CloudWatch, Datadog, etc.)
- Implementar autenticación y HTTPS
- Configurar persistencia de datos más robusta
- Ajustar retención de métricas según necesidades

## 🧪 Ejemplos de Pruebas del Sistema de Monitoreo

### 1. 📊 **Probar Prometheus**

#### Verificar que Prometheus esté capturando métricas:
```bash
# Ir a http://localhost:9090
# En la barra de consultas, probar estas queries:
```

**Consultas PromQL básicas:**
```promql
# Ver todos los servicios monitoreados
up

# Métricas de CPU del sistema
100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Requests HTTP por segundo
rate(http_requests_total[5m])

# Latencia P95 de requests HTTP
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Conexiones activas por servicio
active_connections

# Pagos procesados por minuto
rate(payments_processed_total[1m]) * 60
```

#### Simular métricas (cuando tengas los microservicios corriendo):
```powershell
# Hacer requests a los endpoints para generar métricas
curl http://localhost:3000/health    # Usuarios
curl http://localhost:3002/health    # Préstamos  
curl http://localhost:3003/health    # Pagos

# Ver las métricas generadas
curl http://localhost:3000/metrics
curl http://localhost:3002/metrics
curl http://localhost:3003/metrics
```

### 2. 🚨 **Probar AlertManager**

#### Verificar configuración:
```bash
# Ir a http://localhost:9093
# Deberías ver la interfaz de AlertManager
```

#### Simular una alerta (método manual):
```powershell
# Enviar una alerta de prueba a AlertManager
$alertData = @{
    "alerts" = @(
        @{
            "labels" = @{
                "alertname" = "TestAlert"
                "service" = "test-service"
                "severity" = "warning"
            }
            "annotations" = @{
                "summary" = "Alerta de prueba"
                "description" = "Esta es una alerta de prueba para verificar el sistema"
            }
            "startsAt" = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:9093/api/v1/alerts" -Method POST -Body $alertData -ContentType "application/json"
```

#### Probar alertas automáticas:
```bash
# Detener un servicio para activar la alerta "ServiceDown"
docker stop node-exporter

# Esperar 30 segundos y verificar en AlertManager
# Luego reiniciar:
docker start node-exporter
```

### 3. 📈 **Probar Grafana**

#### Configurar dashboards:
```bash
# Ir a http://localhost:3030
# Login: admin / admin123
```

**Dashboard básico de sistema:**
1. Crear nuevo dashboard
2. Agregar panel con query: `up`
3. Agregar panel con query: `rate(http_requests_total[5m])`
4. Agregar panel con query: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`

### 4. 🖥️ **Probar Node Exporter**

```powershell
# Ver métricas del sistema
curl http://localhost:9100/metrics | Select-String "node_cpu"
curl http://localhost:9100/metrics | Select-String "node_memory"
curl http://localhost:9100/metrics | Select-String "node_filesystem"
```

### 5. 🐳 **Probar cAdvisor**

```bash
# Ir a http://localhost:8081
# Ver métricas de contenedores en tiempo real
```

### 6. 🗄️ **Probar PostgreSQL Exporter**

```powershell
# Ver métricas de base de datos
curl http://localhost:9187/metrics | Select-String "pg_"
```


## 📊 **Consultas PromQL Útiles**

```promql
# Top 5 endpoints más lentos
topk(5, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))

# Servicios con mayor tasa de errores
topk(5, rate(http_requests_total{status_code=~"5.."}[5m]))

# Uso de memoria por servicio
(active_connections * 100) / 1000

# Crecimiento de pagos por hora
increase(payments_processed_total[1h])

# Préstamos activos vs vencidos
sum(active_loans_total) / sum(overdue_loans_total)
```


**💡 Tip**: Ejecuta estas pruebas regularmente para asegurar que tu sistema de monitoreo esté funcionando correctamente.
