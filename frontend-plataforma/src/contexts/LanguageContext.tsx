import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getBrowserLanguage } from '../utils/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  availableLanguages: { code: string; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('es');

  const availableLanguages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'qu', name: 'Runasimi', flag: '🇵🇪' }
  ];

  useEffect(() => {
    // Cargar idioma desde localStorage o usar el del navegador
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const initialLanguage = savedLanguage || getBrowserLanguage();
    setLanguageState(initialLanguage);
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
    
    // Enviar información del idioma al backend para métricas culturales
    if (typeof window !== 'undefined') {
      // Configurar header para próximas peticiones
      const event = new CustomEvent('languageChanged', { detail: { language: lang } });
      window.dispatchEvent(event);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};
