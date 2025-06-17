import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../utils/translations';
import styles from '../styles/LanguageSelector.module.css';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation(language);
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className={styles.languageSelector}>
      <button 
        className={styles.selectorButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Selector de idioma"
      >
        <FaGlobe className={styles.globeIcon} />
        <span className={styles.currentLang}>
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <FaChevronDown className={`${styles.chevronIcon} ${isOpen ? styles.chevronUp : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span>Seleccionar idioma / Select language / Siminkuna akllana</span>
          </div>
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.dropdownItem} ${language === lang.code ? styles.active : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className={styles.flag}>{lang.flag}</span>
              <span className={styles.languageName}>{lang.name}</span>
              {language === lang.code && (
                <span className={styles.checkmark}>✓</span>
              )}
            </button>
          ))}
          
          {/* Información cultural */}
          <div className={styles.culturalInfo}>
            <div className={styles.culturalNote}>
              <small>
                {language === 'qu' ? 
                  'Runasimimi rimayqa culturanchispa kallpanchakunan' :
                  language === 'en' ?
                  'Language selection supports cultural diversity' :
                  'La selección de idioma apoya la diversidad cultural'
                }
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar el dropdown */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;
