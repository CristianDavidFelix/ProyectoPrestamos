import { useState, useEffect, createContext, useContext } from 'react';

// Contexto de internacionalización
const I18nContext = createContext();

// Hook para usar internacionalización
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n debe usarse dentro de I18nProvider');
  }
  return context;
};

// Proveedor de internacionalización
export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar traducciones
  useEffect(() => {
    loadTranslations(language);
  }, [language]);

  const loadTranslations = async (lang) => {
    setLoading(true);
    try {
      const response = await import(`../locales/${lang}.json`);
      setTranslations(response.default);
    } catch (error) {
      console.error(`Error cargando traducciones para ${lang}:`, error);
      // Fallback a español si hay error
      if (lang !== 'es') {
        const fallback = await import('../locales/es.json');
        setTranslations(fallback.default);
      }
    }
    setLoading(false);
  };

  // Función para obtener texto traducido
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Traducción no encontrada para: ${key}`);
        return key;
      }
    }
    
    // Reemplazar parámetros en el texto
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] || match;
      });
    }
    
    return value;
  };

  // Cambiar idioma
  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('preferred-language', newLang);
  };

  // Obtener idiomas disponibles
  const getAvailableLanguages = () => [
    { code: 'es', name: 'Español', nativeName: 'Español' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'qu', name: 'Quechua', nativeName: 'Runasimi' }
  ];

  // Detectar idioma del navegador al cargar
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language');
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs = ['es', 'en', 'qu'];
    
    if (savedLang && supportedLangs.includes(savedLang)) {
      setLanguage(savedLang);
    } else if (supportedLangs.includes(browserLang)) {
      setLanguage(browserLang);
    }
  }, []);

  const value = {
    language,
    translations,
    loading,
    t,
    changeLanguage,
    getAvailableLanguages
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// Componente selector de idioma
export const LanguageSelector = ({ className = "" }) => {
  const { language, changeLanguage, getAvailableLanguages } = useI18n();
  const languages = getAvailableLanguages();

  return (
    <select 
      value={language} 
      onChange={(e) => changeLanguage(e.target.value)}
      className={`language-selector ${className}`}
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        cursor: 'pointer'
      }}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
};

// HOC para componentes con internacionalización
export const withI18n = (Component) => {
  return (props) => {
    const i18n = useI18n();
    return <Component {...props} i18n={i18n} />;
  };
};
