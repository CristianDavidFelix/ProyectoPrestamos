const express = require('express');
const router = express.Router();
const { 
  getCulturalStats, 
  registerCulturalLoan, 
  generateCulturalReport 
} = require('../middlewares/cultural');

// Endpoint para obtener estadísticas culturales
router.get('/stats', async (req, res) => {
  try {
    const stats = getCulturalStats();
    res.json({
      success: true,
      data: stats,
      message: 'Estadísticas culturales obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas culturales:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Endpoint para calculadora cultural de préstamos
router.post('/loan-calculator', async (req, res) => {
  try {
    const { amount, term, purpose, culturalConsiderations } = req.body;
    
    if (!amount || !term) {
      return res.status(400).json({
        success: false,
        error: 'Monto y plazo son requeridos'
      });
    }

    // Cálculo con consideraciones culturales
    const principal = parseFloat(amount);
    const months = parseInt(term);
    
    // Tasas diferenciadas por propósito cultural
    let interestRate = 0.12; // 12% anual base
    
    if (purpose === 'agriculture') {
      interestRate = 0.08; // 8% para agricultura
    } else if (purpose === 'education') {
      interestRate = 0.06; // 6% para educación
    } else if (purpose === 'health') {
      interestRate = 0.07; // 7% para salud
    } else if (culturalConsiderations) {
      interestRate = 0.10; // 10% con consideraciones culturales
    }

    const monthlyRate = interestRate / 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1);

    const calculation = {
      principal,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(monthlyPayment * months * 100) / 100,
      totalInterest: Math.round((monthlyPayment * months - principal) * 100) / 100,
      interestRate: interestRate * 100,
      culturalBenefits: {
        reducedRate: culturalConsiderations || ['agriculture', 'education', 'health'].includes(purpose),
        communitySupport: purpose === 'agriculture' || purpose === 'business',
        flexiblePayments: purpose === 'agriculture'
      }
    };

    // Información cultural específica
    const culturalInfo = getCulturalInfoByPurpose(purpose, req.cultural.language);

    res.json({
      success: true,
      data: {
        calculation,
        culturalInfo,
        language: req.cultural.language
      },
      message: 'Cálculo realizado con consideraciones culturales'
    });

  } catch (error) {
    console.error('Error en calculadora cultural:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Endpoint para opciones de pago estacionales
router.post('/seasonal-payment-options', async (req, res) => {
  try {
    const { loanAmount, purpose, region } = req.body;
    
    const seasonalOptions = generateSeasonalPaymentOptions(loanAmount, purpose, region);
    
    res.json({
      success: true,
      data: seasonalOptions,
      message: 'Opciones de pago estacional generadas'
    });
  } catch (error) {
    console.error('Error generando opciones estacionales:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Endpoint para reporte de interculturalidad
router.get('/report', async (req, res) => {
  try {
    const report = generateCulturalReport();
    res.json({
      success: true,
      data: report,
      message: 'Reporte de interculturalidad generado'
    });
  } catch (error) {
    console.error('Error generando reporte cultural:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Endpoint para registrar perfil cultural del usuario
router.post('/cultural-profile', async (req, res) => {
  try {
    const { 
      preferredLanguage, 
      culturalBackground, 
      communityAffiliation,
      traditionalKnowledge,
      paymentPreferences 
    } = req.body;

    // Aquí normalmente guardarías en la base de datos
    const culturalProfile = {
      userId: req.user?.id || 'anonymous',
      preferredLanguage: preferredLanguage || 'es',
      culturalBackground: culturalBackground || 'mestizo',
      communityAffiliation: communityAffiliation || null,
      traditionalKnowledge: traditionalKnowledge || false,
      paymentPreferences: paymentPreferences || 'monthly',
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: culturalProfile,
      message: 'Perfil cultural registrado exitosamente'
    });
  } catch (error) {
    console.error('Error registrando perfil cultural:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Función auxiliar para obtener información cultural por propósito
function getCulturalInfoByPurpose(purpose, language = 'es') {
  const culturalData = {
    agriculture: {
      es: {
        title: "Préstamo Agrícola Culturalmente Adaptado",
        description: "Respetamos los ciclos de siembra y cosecha tradicionales",
        paymentOptions: ["Pago al final de cosecha", "Pagos trimestrales", "Pagos según calendario lunar"],
        culturalNote: "Este préstamo considera el principio del 'ayni' y los ciclos naturales",
        benefits: ["Tasa reducida para productores", "Flexibilidad en fechas de pago", "Apoyo técnico ancestral"]
      },
      en: {
        title: "Culturally Adapted Agricultural Loan",
        description: "We respect traditional planting and harvest cycles",
        paymentOptions: ["Payment at harvest end", "Quarterly payments", "Payments according to lunar calendar"],
        culturalNote: "This loan considers the 'ayni' principle and natural cycles",
        benefits: ["Reduced rate for producers", "Payment date flexibility", "Ancestral technical support"]
      },
      qu: {
        title: "Chakra Llamkaypa Qolqe Mañakuynin",
        description: "Tarpuypa, pallay mit'apa respetaykuku",
        paymentOptions: ["Pallaypi tukuchispa qoy", "Kimsa killapi qoy", "Killa rikurisqanman hina qoy"],
        culturalNote: "Kay qolqe mañakuyqa ayni principiota, pachamamapa mit'ankunatapas qawan",
        benefits: ["Chakra runakunapaq pisiyasqa interes", "Qoy p'unchay cambiana", "Ñawpa yachay yanapay"]
      }
    },
    business: {
      es: {
        title: "Préstamo para Emprendimiento Comunitario",
        description: "Apoyamos negocios que fortalecen la comunidad",
        paymentOptions: ["Pagos flexibles según ingresos", "Pagos mensuales", "Pagos estacionales"],
        culturalNote: "Basado en los principios de reciprocidad y desarrollo comunitario",
        benefits: ["Apoyo a economía local", "Capacitación en gestión", "Red de contactos comunitarios"]
      }
    },
    education: {
      es: {
        title: "Préstamo Educativo Intercultural",
        description: "Inversión en educación con respeto a la diversidad cultural",
        paymentOptions: ["Pagos diferidos hasta graduación", "Pagos mensuales reducidos", "Becas de excelencia"],
        culturalNote: "Promovemos la educación intercultural bilingüe",
        benefits: ["Tasa preferencial", "Apoyo académico", "Preservación cultural"]
      }
    }
  };

  return culturalData[purpose]?.[language] || culturalData[purpose]?.es || null;
}

// Función auxiliar para generar opciones de pago estacional
function generateSeasonalPaymentOptions(amount, purpose, region) {
  const baseAmount = parseFloat(amount);
  
  // Calendarios estacionales por región (ejemplo simplificado)
  const seasonalCalendars = {
    costa: {
      siembra: ['marzo', 'abril'],
      cosecha: ['agosto', 'septiembre'],
      festivales: ['febrero', 'octubre']
    },
    sierra: {
      siembra: ['septiembre', 'octubre', 'noviembre'],
      cosecha: ['abril', 'mayo', 'junio'],
      festivales: ['junio', 'diciembre']
    },
    selva: {
      siembra: ['todo el año'],
      cosecha: ['todo el año'],
      festivales: ['febrero', 'junio', 'octubre']
    }
  };

  const calendar = seasonalCalendars[region] || seasonalCalendars.sierra;
  
  return {
    region,
    purpose,
    seasonalOptions: [
      {
        type: 'harvest_payment',
        name: 'Pago al Final de Cosecha',
        description: 'Pago único al finalizar la cosecha principal',
        paymentMonths: calendar.cosecha,
        benefits: ['Sin presión durante siembra', 'Pago con ingresos de cosecha']
      },
      {
        type: 'seasonal_installments',
        name: 'Cuotas Estacionales',
        description: 'Pagos adaptados al calendario agrícola',
        paymentMonths: [...calendar.cosecha, ...calendar.festivales],
        benefits: ['Respeta ciclos naturales', 'Pagos cuando hay ingresos']
      },
      {
        type: 'cultural_calendar',
        name: 'Calendario Cultural',
        description: 'Pagos evitando festividades importantes',
        excludeMonths: calendar.festivales,
        benefits: ['Respeta tradiciones', 'Evita conflictos culturales']
      }
    ],
    recommendations: [
      'Considerar el calendario lunar para fechas exactas',
      'Coordinar con festividades comunitarias',
      'Incluir periodo de gracia por factores climáticos'
    ]
  };
}

module.exports = router;
