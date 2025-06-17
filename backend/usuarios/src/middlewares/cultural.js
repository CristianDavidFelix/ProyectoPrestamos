const {
  incrementUserRegistration,
  incrementUserLogin,
  measureDatabaseQuery
} = require('./metrics');

// Registro de uso intercultural
const culturalMetrics = new Map();

// Middleware para registrar uso de funcionalidades interculturales
const culturalMiddleware = (req, res, next) => {
  // Detectar idioma de la solicitud
  const language = req.headers['accept-language'] || req.query.lang || 'es';
  const userAgent = req.headers['user-agent'] || '';
  const endpoint = req.path;
  
  // Registrar uso por idioma
  const langCode = language.split(',')[0].split('-')[0].toLowerCase();
  const supportedLangs = ['es', 'en', 'qu'];
  const detectedLang = supportedLangs.includes(langCode) ? langCode : 'es';
  
  // Incrementar contador de uso por idioma
  const langKey = `language_${detectedLang}`;
  culturalMetrics.set(langKey, (culturalMetrics.get(langKey) || 0) + 1);
  
  // Detectar si es una solicitud de funcionalidad cultural
  const culturalEndpoints = [
    '/api/loans/cultural-calculator',
    '/api/loans/seasonal-payment',
    '/api/loans/community-guarantee',
    '/api/users/cultural-profile'
  ];
  
  const isCulturalEndpoint = culturalEndpoints.some(ep => endpoint.includes(ep));
  
  if (isCulturalEndpoint) {
    const culturalKey = `cultural_feature_usage`;
    culturalMetrics.set(culturalKey, (culturalMetrics.get(culturalKey) || 0) + 1);
    
    // Registrar por tipo de funcionalidad
    if (endpoint.includes('calculator')) {
      culturalMetrics.set('cultural_calculator_usage', (culturalMetrics.get('cultural_calculator_usage') || 0) + 1);
    }
    if (endpoint.includes('seasonal')) {
      culturalMetrics.set('seasonal_payment_usage', (culturalMetrics.get('seasonal_payment_usage') || 0) + 1);
    }
    if (endpoint.includes('community')) {
      culturalMetrics.set('community_guarantee_usage', (culturalMetrics.get('community_guarantee_usage') || 0) + 1);
    }
  }
  
  // Añadir información cultural al objeto request
  req.cultural = {
    language: detectedLang,
    isCulturalEndpoint,
    userAgent,
    timestamp: new Date().toISOString()
  };
  
  next();
};

// Función para obtener estadísticas culturales
const getCulturalStats = () => {
  const stats = {};
  
  // Convertir Map a objeto
  for (const [key, value] of culturalMetrics.entries()) {
    stats[key] = value;
  }
  
  // Calcular porcentajes de uso por idioma
  const totalLanguageRequests = (stats.language_es || 0) + (stats.language_en || 0) + (stats.language_qu || 0);
  
  if (totalLanguageRequests > 0) {
    stats.language_percentages = {
      spanish: ((stats.language_es || 0) / totalLanguageRequests * 100).toFixed(2),
      english: ((stats.language_en || 0) / totalLanguageRequests * 100).toFixed(2),
      quechua: ((stats.language_qu || 0) / totalLanguageRequests * 100).toFixed(2)
    };
  }
  
  return stats;
};

// Función para registrar préstamo con consideraciones culturales
const registerCulturalLoan = (loanData, culturalContext) => {
  const key = `cultural_loan_${culturalContext.purpose || 'general'}`;
  culturalMetrics.set(key, (culturalMetrics.get(key) || 0) + 1);
  
  // Registrar por tipo de consideración cultural
  if (culturalContext.seasonalPayment) {
    culturalMetrics.set('seasonal_payment_loans', (culturalMetrics.get('seasonal_payment_loans') || 0) + 1);
  }
  
  if (culturalContext.communityGuarantee) {
    culturalMetrics.set('community_guarantee_loans', (culturalMetrics.get('community_guarantee_loans') || 0) + 1);
  }
  
  if (culturalContext.traditionalCalendar) {
    culturalMetrics.set('traditional_calendar_loans', (culturalMetrics.get('traditional_calendar_loans') || 0) + 1);
  }
  
  return {
    loanId: loanData.id,
    culturalFeatures: culturalContext,
    registeredAt: new Date().toISOString()
  };
};

// Función para generar reporte de interculturalidad
const generateCulturalReport = () => {
  const stats = getCulturalStats();
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_requests: Object.values(stats).reduce((sum, val) => {
        return typeof val === 'number' ? sum + val : sum;
      }, 0),
      cultural_feature_usage: stats.cultural_feature_usage || 0,
      language_distribution: stats.language_percentages || {}
    },
    detailed_metrics: stats,
    cultural_impact: {
      multilingual_accessibility: (stats.language_en || 0) + (stats.language_qu || 0) > 0,
      indigenous_language_support: (stats.language_qu || 0) > 0,
      cultural_calculator_adoption: ((stats.cultural_calculator_usage || 0) / (stats.cultural_feature_usage || 1) * 100).toFixed(2),
      community_features_usage: ((stats.community_guarantee_usage || 0) + (stats.seasonal_payment_usage || 0))
    },
    recommendations: generateCulturalRecommendations(stats)
  };
  
  return report;
};

// Función para generar recomendaciones culturales
const generateCulturalRecommendations = (stats) => {
  const recommendations = [];
  
  // Recomendación sobre idiomas
  const quechuaUsage = stats.language_qu || 0;
  const totalRequests = (stats.language_es || 0) + (stats.language_en || 0) + quechuaUsage;
  
  if (quechuaUsage === 0 && totalRequests > 50) {
    recommendations.push({
      type: 'language_accessibility',
      priority: 'high',
      message: 'Considerar promocionar el soporte en quechua para mejorar la inclusión',
      action: 'Realizar campaña de difusión en comunidades indígenas'
    });
  }
  
  // Recomendación sobre funcionalidades culturales
  const culturalUsage = stats.cultural_feature_usage || 0;
  if (culturalUsage < totalRequests * 0.1) {
    recommendations.push({
      type: 'cultural_features',
      priority: 'medium',
      message: 'Bajo uso de funcionalidades culturales - mejorar visibilidad',
      action: 'Destacar opciones culturales en la interfaz principal'
    });
  }
  
  // Recomendación sobre garantías comunitarias
  const communityUsage = stats.community_guarantee_usage || 0;
  if (communityUsage === 0 && totalRequests > 100) {
    recommendations.push({
      type: 'community_engagement',
      priority: 'medium',
      message: 'Sin uso de garantías comunitarias - explorar alianzas',
      action: 'Establecer partnerships con organizaciones comunitarias'
    });
  }
  
  return recommendations;
};

module.exports = {
  culturalMiddleware,
  getCulturalStats,
  registerCulturalLoan,
  generateCulturalReport,
  generateCulturalRecommendations
};
