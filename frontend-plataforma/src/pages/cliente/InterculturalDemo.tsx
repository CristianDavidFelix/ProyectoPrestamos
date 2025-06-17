import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../utils/translations';
import Sidebar from '../../../components/Sidebar';
import CulturalCalculator from '../../components/CulturalCalculator';
import { getCulturalStats } from '../../services/api';
import styles from '../../styles/InterculturalDemo.module.css';
import { 
  FaGlobe, 
  FaChartBar, 
  FaUsers, 
  FaLeaf, 
  FaHeart,
  FaGraduationCap,
  FaStore,
  FaInfoCircle,
  FaArrowRight
} from 'react-icons/fa';

const InterculturalDemo = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [role, setRole] = useState<'administrador' | 'cliente' | null>(null);
  const [culturalStats, setCulturalStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('role') as 'administrador' | 'cliente';
      setRole(storedRole);
      
      // Cargar estadísticas culturales
      loadCulturalStats();
    }
  }, []);

  const loadCulturalStats = async () => {
    setLoading(true);
    try {
      const stats = await getCulturalStats();
      setCulturalStats(stats.data);
    } catch (error) {
      console.error('Error loading cultural stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: FaGlobe,
      title: language === 'qu' ? 'Simikuna Akllay' : language === 'en' ? 'Multi-language Support' : 'Soporte Multiidioma',
      description: language === 'qu' ? 
        'Runasimi, Español, Inglés simikunapi atisun' :
        language === 'en' ?
        'Support for Spanish, English, and Quechua languages' :
        'Soporte para idiomas español, inglés y quechua',
      color: '#3b82f6'
    },
    {
      icon: FaLeaf,
      title: language === 'qu' ? 'Chakra Llamkay Yanapaykuna' : language === 'en' ? 'Agricultural Support' : 'Apoyo Agrícola',
      description: language === 'qu' ?
        'Chakra runakunapaq aswan allin chaniyuq qullqi' :
        language === 'en' ?
        'Special rates and seasonal payment options for farmers' :
        'Tasas especiales y opciones de pago estacional para agricultores',
      color: '#10b981'
    },
    {
      icon: FaUsers,
      title: language === 'qu' ? 'Ayllu Garantía' : language === 'en' ? 'Community Guarantee' : 'Garantía Comunitaria',
      description: language === 'qu' ?
        'Aylluwan kuska garantía ruway atisun' :
        language === 'en' ?
        'Community-based guarantee systems' :
        'Sistemas de garantía basados en la comunidad',
      color: '#f59e0b'
    },
    {
      icon: FaGraduationCap,
      title: language === 'qu' ? 'Yachay Yanapay' : language === 'en' ? 'Education Support' : 'Apoyo Educativo',
      description: language === 'qu' ?
        'Yachayninchis wiñachinapaq qullqi yanapay' :
        language === 'en' ?
        'Special financing for education and cultural preservation' :
        'Financiamiento especial para educación y preservación cultural',
      color: '#8b5cf6'
    }
  ];

  if (!role) {
    return <div>Cargando...</div>;
  }

  return (
    <div className={styles.demoContainer}>
      <Sidebar role={role} />
      
      <div className={styles.contentContainer}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <FaGlobe className={styles.headerIcon} />
              <div>
                <h1 className={styles.title}>
                  {language === 'qu' ? 
                    'Intercultural Qullqi Yanapa' :
                    language === 'en' ?
                    'Intercultural Financial Platform' :
                    'Plataforma Financiera Intercultural'
                  }
                </h1>
                <p className={styles.subtitle}>
                  {language === 'qu' ?
                    'Culturanchispa respetowantaq qullqi yanapakuna' :
                    language === 'en' ?
                    'Financial services that respect and celebrate cultural diversity' :
                    'Servicios financieros que respetan y celebran la diversidad cultural'
                  }
                </p>
              </div>
            </div>
          </header>

          {/* Características Interculturales */}
          <section className={styles.featuresSection}>
            <h2 className={styles.sectionTitle}>
              {language === 'qu' ? 
                'Culturanchispa Allinkaykuna' :
                language === 'en' ?
                'Cultural Features' :
                'Características Culturales'
              }
            </h2>
            
            <div className={styles.featuresGrid}>
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className={styles.featureCard} style={{ borderTopColor: feature.color }}>
                    <div className={styles.featureIcon} style={{ color: feature.color }}>
                      <IconComponent />
                    </div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDescription}>{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Calculadora Cultural */}
          <section className={styles.calculatorSection}>
            <h2 className={styles.sectionTitle}>
              {language === 'qu' ? 
                'Cultural Qullqi Yupana' :
                language === 'en' ?
                'Cultural Loan Calculator' :
                'Calculadora Cultural de Préstamos'
              }
            </h2>
            
            <div className={styles.calculatorWrapper}>
              <CulturalCalculator />
            </div>
          </section>

          {/* Estadísticas de Uso Cultural */}
          {culturalStats && (
            <section className={styles.statsSection}>
              <h2 className={styles.sectionTitle}>
                {language === 'qu' ? 
                  'Cultural Rikuchikuykuna' :
                  language === 'en' ?
                  'Cultural Usage Statistics' :
                  'Estadísticas de Uso Cultural'
                }
              </h2>
              
              <div className={styles.statsGrid}>
                {culturalStats.language_percentages && (
                  <div className={styles.statCard}>
                    <h3>
                      {language === 'qu' ? 'Simikuna Llamkay' : 
                       language === 'en' ? 'Language Usage' : 
                       'Uso de Idiomas'}
                    </h3>
                    <div className={styles.languageStats}>
                      <div className={styles.languageStat}>
                        <span>🇪🇸 Español</span>
                        <span>{culturalStats.language_percentages.spanish}%</span>
                      </div>
                      <div className={styles.languageStat}>
                        <span>🇺🇸 English</span>
                        <span>{culturalStats.language_percentages.english}%</span>
                      </div>
                      <div className={styles.languageStat}>
                        <span>🇵🇪 Runasimi</span>
                        <span>{culturalStats.language_percentages.quechua}%</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className={styles.statCard}>
                  <h3>
                    {language === 'qu' ? 'Cultural Ruwaykuna' : 
                     language === 'en' ? 'Cultural Features Used' : 
                     'Funcionalidades Culturales Usadas'}
                  </h3>
                  <div className={styles.featureUsage}>
                    <div className={styles.usageStat}>
                      <FaLeaf />
                      <span>
                        {language === 'qu' ? 'Yupana Llamkay' : 
                         language === 'en' ? 'Calculator Usage' : 
                         'Uso de Calculadora'}: {culturalStats.cultural_calculator_usage || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Información Cultural */}
          <section className={styles.infoSection}>
            <div className={styles.infoCard}>
              <FaInfoCircle className={styles.infoIcon} />
              <div className={styles.infoContent}>
                <h3>
                  {language === 'qu' ? 
                    'Culturanchispa Chaninchaynin' :
                    language === 'en' ?
                    'Cultural Values' :
                    'Valores Culturales'
                  }
                </h3>
                <p>
                  {language === 'qu' ?
                    'Kay platformaqa culturanchispa diversidadninta chaninchan, ayllunchispaq, yachayninchispaq, traditionninchispaq respectota qun.' :
                    language === 'en' ?
                    'This platform celebrates cultural diversity, providing respect for our communities, knowledge, and traditions.' :
                    'Esta plataforma celebra la diversidad cultural, brindando respeto a nuestras comunidades, conocimientos y tradiciones.'
                  }
                </p>
                <div className={styles.culturalValues}>
                  <span className={styles.value}>
                    {language === 'qu' ? 'Ayni' : language === 'en' ? 'Reciprocity' : 'Reciprocidad'}
                  </span>
                  <span className={styles.value}>
                    {language === 'qu' ? 'Minga' : language === 'en' ? 'Community Work' : 'Trabajo Comunitario'}
                  </span>
                  <span className={styles.value}>
                    {language === 'qu' ? 'Sumak Kawsay' : language === 'en' ? 'Good Living' : 'Buen Vivir'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className={styles.ctaSection}>
            <div className={styles.ctaCard}>
              <h2>
                {language === 'qu' ? 
                  'Qullqita Mañakuy' :
                  language === 'en' ?
                  'Apply for a Cultural Loan' :
                  'Solicita un Préstamo Cultural'
                }
              </h2>
              <p>
                {language === 'qu' ?
                  'Culturanchispa contextomanta aswan allin chaniyuq qullqita tariy' :
                  language === 'en' ?
                  'Get better rates and terms based on your cultural context' :
                  'Obtén mejores tasas y condiciones basadas en tu contexto cultural'
                }
              </p>
              <button className={styles.ctaButton}>
                <span>
                  {language === 'qu' ? 'Qallariy' : language === 'en' ? 'Get Started' : 'Comenzar'}
                </span>
                <FaArrowRight />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InterculturalDemo;
