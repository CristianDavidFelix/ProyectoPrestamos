// Sistema de traducciones para soporte multicultural
export interface Translation {
  [key: string]: string | Translation;
}

export interface Translations {
  [language: string]: Translation;
}

export const translations: Translations = {
  es: {
    // Navegación
    nav: {
      dashboard: "Dashboard",
      solicitar_prestamo: "Solicitar Préstamo",
      mis_prestamos: "Mis Préstamos", 
      pagar_cuotas: "Pagar Cuotas",
      historial_crediticio: "Historial Crediticio",
      gestionar_prestamos: "Gestionar Préstamos",
      historial_pagos: "Historial de Pagos",
      administration: "Administración",
      my_account: "Mi Cuenta",
      intercultural_demo: "Demo Intercultural"
    },
    // Formularios
    forms: {
      monto: "Monto",
      plazo: "Plazo",
      tasa: "Tasa de Interés",
      proposito: "Propósito del Préstamo",
      calcular: "Calcular",
      solicitar: "Solicitar",
      pagar: "Pagar"
    },
    // Calculadora Cultural
    cultural: {
      calculator_title: "Calculadora Cultural de Préstamos",
      cultural_benefits: "Beneficios Culturales",
      seasonal_payments: "Pagos Estacionales",
      community_guarantee: "Garantía Comunitaria",
      purpose_agriculture: "Agricultura",
      purpose_education: "Educación", 
      purpose_health: "Salud",
      purpose_business: "Negocio",
      reduced_rate: "Tasa Reducida",
      flexible_payments: "Pagos Flexibles",
      community_support: "Apoyo Comunitario"
    },
    // Mensajes
    messages: {
      welcome: "Bienvenido",
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      no_data: "No hay datos disponibles"
    },
    // Mensajes del sistema
    system: {
      language_changed: "Idioma cambiado exitosamente",
      cultural_context_detected: "Contexto cultural detectado",
      loading_cultural_data: "Cargando datos culturales..."
    }
  },
  en: {
    // Navigation
    nav: {
      dashboard: "Dashboard",
      solicitar_prestamo: "Apply for Loan",
      mis_prestamos: "My Loans",
      pagar_cuotas: "Pay Installments", 
      historial_crediticio: "Credit History",
      gestionar_prestamos: "Manage Loans",
      historial_pagos: "Payment History",
      administration: "Administration",
      my_account: "My Account",
      intercultural_demo: "Intercultural Demo"
    },
    // Forms
    forms: {
      monto: "Amount",
      plazo: "Term",
      tasa: "Interest Rate",
      proposito: "Loan Purpose",
      calcular: "Calculate",
      solicitar: "Apply",
      pagar: "Pay"
    },
    // Cultural Calculator
    cultural: {
      calculator_title: "Cultural Loan Calculator",
      cultural_benefits: "Cultural Benefits",
      seasonal_payments: "Seasonal Payments",
      community_guarantee: "Community Guarantee",
      purpose_agriculture: "Agriculture",
      purpose_education: "Education",
      purpose_health: "Health", 
      purpose_business: "Business",
      reduced_rate: "Reduced Rate",
      flexible_payments: "Flexible Payments",
      community_support: "Community Support"
    },
    // Messages
    messages: {
      welcome: "Welcome",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      no_data: "No data available"
    },
    // System messages
    system: {
      language_changed: "Language changed successfully",
      cultural_context_detected: "Cultural context detected",
      loading_cultural_data: "Loading cultural data..."
    }
  },
  qu: {
    // Navegación en Quechua
    nav: {
      dashboard: "Pantallay",
      solicitar_prestamo: "Qullqita Mañakuy",
      mis_prestamos: "Ñuqap Qullqiykuna",
      pagar_cuotas: "Qullqita Quy",
      historial_crediticio: "Qullqi Willakuy",
      gestionar_prestamos: "Qullqikunata Kamachiy",
      historial_pagos: "Qullqi Quy Willakuy",
      administration: "Kamachikuy",
      my_account: "Ñuqap Cuentay",
      intercultural_demo: "Intercultural Rikuchiy"
    },
    // Formularios
    forms: {
      monto: "Qullqip Chanin",
      plazo: "Pachaq Kaq",
      tasa: "Mirachiypaq",
      proposito: "Imapaq Kasqan",
      calcular: "Yupay",
      solicitar: "Mañakuy",
      pagar: "Quy"
    },
    // Calculadora Cultural
    cultural: {
      calculator_title: "Qullqi Yupana Cultural",
      cultural_benefits: "Culturamanta Allinkaykuna",
      seasonal_payments: "Pachap Qullqi Quy",
      community_guarantee: "Ayllu Garantía",
      purpose_agriculture: "Chakra Llamkay",
      purpose_education: "Yachay",
      purpose_health: "Qhali Kay",
      purpose_business: "Ranqhay",
      reduced_rate: "Pisiyachisqa Chanin",
      flexible_payments: "Ayninakuq Qullqi Quy",
      community_support: "Ayllu Yanapay"
    },
    // Mensajes
    messages: {
      welcome: "Allin Hamuy",
      loading: "Suyaspa...",
      error: "Pantay",
      success: "Allin",
      no_data: "Mana willakuykunachu"
    },
    // Mensajes del sistema
    system: {
      language_changed: "Simiqa allinta tikrakurqan",
      cultural_context_detected: "Culturaq contextonta tarisqani",
      loading_cultural_data: "Cultural willakuykunata kargaspa..."
    }
  }
};

// Hook para usar traducciones
export const useTranslation = (language: string = 'es') => {
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language] || translations.es;
    
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback a español si no encuentra la traducción
        result = translations.es;
        for (const fallbackKey of keys) {
          result = result?.[fallbackKey];
          if (result === undefined) return key;
        }
        break;
      }
    }
    
    return typeof result === 'string' ? result : key;
  };

  return { t };
};

// Función para obtener el idioma del navegador
export const getBrowserLanguage = (): string => {
  if (typeof window === 'undefined') return 'es';
  
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages = ['es', 'en', 'qu'];
  
  return supportedLanguages.includes(browserLang) ? browserLang : 'es';
};

// Función para detectar si es un contexto cultural específico
export const getCulturalContext = (purpose?: string) => {
  const culturalPurposes = {
    agriculture: {
      seasonal: true,
      community: true,
      traditional: true
    },
    education: {
      seasonal: false,
      community: true,
      traditional: true
    },
    health: {
      seasonal: false,
      community: true,
      traditional: false
    }
  };

  return culturalPurposes[purpose as keyof typeof culturalPurposes] || {
    seasonal: false,
    community: false,
    traditional: false
  };
};
