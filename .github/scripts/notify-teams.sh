#!/bin/bash
# Script de notificaciones a equipos (versión sin tokens externos)

set -e

STATUS=${1:-"unknown"}
COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BRANCH_NAME=${GITHUB_REF#refs/heads/}
DEPLOY_ENV=${DEPLOY_ENV:-"development"}
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Configurar mensaje según el estado
case $STATUS in
    "success")
        EMOJI="✅"
        COLOR="green"
        MESSAGE="Deployment successful!"
        ;;
    "failure")
        EMOJI="❌"
        COLOR="red"
        MESSAGE="Deployment failed!"
        ;;
    *)
        EMOJI="ℹ️"
        COLOR="blue"
        MESSAGE="Deployment status unknown"
        ;;
esac

# Crear mensaje detallado
FULL_MESSAGE="$EMOJI $MESSAGE
🌟 Branch: $BRANCH_NAME
📝 Commit: $COMMIT_SHA
🚀 Environment: $DEPLOY_ENV
⏰ Time: $TIMESTAMP
🔗 Repository: ${GITHUB_REPOSITORY:-"ProyectoPrestamos"}
🔢 Run ID: ${GITHUB_RUN_ID:-"N/A"}"

echo "📢 Notification Summary:"
echo "$FULL_MESSAGE"

# Función para notificación básica por consola
notify_console() {
    echo ""
    echo "════════════════════════════════════════"
    echo "           DEPLOYMENT NOTIFICATION"
    echo "════════════════════════════════════════"
    echo "$FULL_MESSAGE"
    echo "════════════════════════════════════════"
    echo ""
}

# Función para notificación a Slack (solo si el webhook está disponible)
notify_slack() {
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        echo "📱 Sending Slack notification..."
        
        SLACK_PAYLOAD=$(cat <<EOF
{
    "text": "$FULL_MESSAGE",
    "attachments": [
        {
            "color": "$COLOR",
            "fields": [
                {
                    "title": "Status",
                    "value": "$STATUS",
                    "short": true
                },
                {
                    "title": "Environment",
                    "value": "$DEPLOY_ENV",
                    "short": true
                }
            ]
        }
    ]
}
EOF
)
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$SLACK_PAYLOAD" \
            "$SLACK_WEBHOOK_URL" || echo "⚠️ Failed to send Slack notification"
    else
        echo "💬 Slack webhook not configured, skipping Slack notification"
    fi
}

# Función para notificación por email básica
notify_email() {
    if [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "📧 Email notification would be sent to: $NOTIFICATION_EMAIL"
        echo "📝 Subject: Deployment $STATUS - $DEPLOY_ENV"
        echo "📄 Content: $FULL_MESSAGE"
    else
        echo "📧 Email not configured, skipping email notification"
    fi
}

# Ejecutar notificaciones
notify_console
notify_slack
notify_email

echo "✅ Notifications completed successfully!"