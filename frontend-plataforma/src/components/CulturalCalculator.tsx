import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation, getCulturalContext } from '../utils/translations';
import styles from '../styles/CulturalCalculator.module.css';
import { 
  FaCalculator, 
  FaSeedling, 
  FaGraduationCap, 
  FaHeartbeat, 
  FaStore,
  FaUsers,
  FaCalendarAlt,
  FaPercentage,
  FaInfoCircle
} from 'react-icons/fa';
import axios from 'axios';

interface CulturalCalculatorProps {
  onCalculationResult?: (result: any) => void;
}

interface CalculationResult {
  principal: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  interestRate: number;
  culturalBenefits: {
    reducedRate: boolean;
    communitySupport: boolean;
    flexiblePayments: boolean;
  };
}

interface CulturalInfo {
  title: string;
  description: string;
  paymentOptions: string[];
  culturalNote: string;
  benefits: string[];
}

const CulturalCalculator: React.FC<CulturalCalculatorProps> = ({ onCalculationResult }) => {
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  
  const [formData, setFormData] = useState({
    amount: '',
    term: '',
    purpose: '',
    culturalConsiderations: false,
    region: 'sierra',
    seasonalPayments: false
  });
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [culturalInfo, setCulturalInfo] = useState<CulturalInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purposes = [
    { value: 'agriculture', label: t('cultural.purpose_agriculture'), icon: FaSeedling },
    { value: 'education', label: t('cultural.purpose_education'), icon: FaGraduationCap },
    { value: 'health', label: t('cultural.purpose_health'), icon: FaHeartbeat },
    { value: 'business', label: t('cultural.purpose_business'), icon: FaStore }
  ];

  const regions = [
    { value: 'costa', label: 'Costa' },
    { value: 'sierra', label: 'Sierra' },
    { value: 'selva', label: 'Selva' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCalculate = async () => {
    if (!formData.amount || !formData.term) {
      setError(t('messages.error') + ': ' + 'Monto y plazo son requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        term: parseInt(formData.term),
        purpose: formData.purpose,
        culturalConsiderations: formData.culturalConsiderations || 
                               ['agriculture', 'education', 'health'].includes(formData.purpose)
      };

      // Configurar header de idioma para el backend
      const headers = {
        'Accept-Language': language,
        'Content-Type': 'application/json'
      };

      const response = await axios.post(
        'http://localhost:3000/api/cultural/loan-calculator',
        payload,
        { headers }
      );

      if (response.data.success) {
        setResult(response.data.data.calculation);
        setCulturalInfo(response.data.data.culturalInfo);
        
        if (onCalculationResult) {
          onCalculationResult(response.data.data);
        }
      } else {
        setError(response.data.error || t('messages.error'));
      }
    } catch (err: any) {
      console.error('Error calculando préstamo cultural:', err);
      setError(err.response?.data?.error || t('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const culturalContext = getCulturalContext(formData.purpose);

  return (
    <div className={styles.calculatorContainer}>
      <div className={styles.calculatorHeader}>
        <FaCalculator className={styles.headerIcon} />
        <h3>{t('cultural.calculator_title')}</h3>
      </div>

      <div className={styles.calculatorForm}>
        {/* Monto */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {t('forms.monto')}
            <FaPercentage className={styles.labelIcon} />
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Ej: 10000"
            min="1000"
            max="100000"
          />
        </div>

        {/* Plazo */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {t('forms.plazo')} (meses)
            <FaCalendarAlt className={styles.labelIcon} />
          </label>
          <input
            type="number"
            name="term"
            value={formData.term}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Ej: 12"
            min="6"
            max="60"
          />
        </div>

        {/* Propósito Cultural */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {t('forms.proposito')}
            <FaInfoCircle className={styles.labelIcon} />
          </label>
          <div className={styles.purposeGrid}>
            {purposes.map((purpose) => {
              const IconComponent = purpose.icon;
              return (
                <button
                  key={purpose.value}
                  type="button"
                  className={`${styles.purposeButton} ${
                    formData.purpose === purpose.value ? styles.selected : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, purpose: purpose.value }))}
                >
                  <IconComponent className={styles.purposeIcon} />
                  <span>{purpose.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Región */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Región</label>
          <select
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            className={styles.select}
          >
            {regions.map(region => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        {/* Opciones Culturales */}
        {culturalContext.seasonal && (
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="seasonalPayments"
                checked={formData.seasonalPayments}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>{t('cultural.seasonal_payments')}</span>
              <FaUsers className={styles.checkboxIcon} />
            </label>
          </div>
        )}

        {/* Botón Calcular */}
        <button
          onClick={handleCalculate}
          disabled={loading || !formData.amount || !formData.term}
          className={styles.calculateButton}
        >
          {loading ? (
            <>
              <div className={styles.spinner} />
              {t('messages.loading')}
            </>
          ) : (
            <>
              <FaCalculator />
              {t('forms.calcular')}
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Resultados */}
      {result && (
        <div className={styles.resultsContainer}>
          <h4>{t('messages.success')}</h4>
          
          <div className={styles.resultGrid}>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Cuota Mensual:</span>
              <span className={styles.resultValue}>S/ {result.monthlyPayment.toFixed(2)}</span>
            </div>
            
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Total a Pagar:</span>
              <span className={styles.resultValue}>S/ {result.totalPayment.toFixed(2)}</span>
            </div>
            
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Intereses:</span>
              <span className={styles.resultValue}>S/ {result.totalInterest.toFixed(2)}</span>
            </div>
            
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Tasa de Interés:</span>
              <span className={styles.resultValue}>{result.interestRate.toFixed(2)}%</span>
            </div>
          </div>

          {/* Beneficios Culturales */}
          {result.culturalBenefits && (
            <div className={styles.benefitsContainer}>
              <h5>{t('cultural.cultural_benefits')}</h5>
              <div className={styles.benefitsList}>
                {result.culturalBenefits.reducedRate && (
                  <div className={styles.benefit}>
                    <FaPercentage className={styles.benefitIcon} />
                    <span>{t('cultural.reduced_rate')}</span>
                  </div>
                )}
                {result.culturalBenefits.flexiblePayments && (
                  <div className={styles.benefit}>
                    <FaCalendarAlt className={styles.benefitIcon} />
                    <span>{t('cultural.flexible_payments')}</span>
                  </div>
                )}
                {result.culturalBenefits.communitySupport && (
                  <div className={styles.benefit}>
                    <FaUsers className={styles.benefitIcon} />
                    <span>{t('cultural.community_support')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información Cultural */}
          {culturalInfo && (
            <div className={styles.culturalInfoContainer}>
              <h5>{culturalInfo.title}</h5>
              <p>{culturalInfo.description}</p>
              
              {culturalInfo.benefits && culturalInfo.benefits.length > 0 && (
                <div className={styles.culturalBenefits}>
                  <h6>Beneficios Adicionales:</h6>
                  <ul>
                    {culturalInfo.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {culturalInfo.culturalNote && (
                <div className={styles.culturalNote}>
                  <FaInfoCircle />
                  <span>{culturalInfo.culturalNote}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CulturalCalculator;
