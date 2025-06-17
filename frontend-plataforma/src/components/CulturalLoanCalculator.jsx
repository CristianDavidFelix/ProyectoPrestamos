import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';

const CulturalLoanCalculator = () => {
  const { t } = useI18n();
  const [loanData, setLoanData] = useState({
    amount: '',
    term: '',
    purpose: '',
    paymentSchedule: 'monthly',
    culturalConsiderations: true
  });
  
  const [calculation, setCalculation] = useState(null);
  const [culturalInfo, setCulturalInfo] = useState(null);

  // Datos culturales por propósito
  const culturalData = {
    agriculture: {
      es: {
        title: "Préstamo Agrícola Culturalmente Adaptado",
        description: "Respetamos los ciclos de siembra y cosecha tradicionales",
        paymentOptions: ["Pago al final de cosecha", "Pagos trimestrales", "Pagos según calendario lunar"],
        culturalNote: "Este préstamo considera el principio del 'ayni' y los ciclos naturales"
      },
      en: {
        title: "Culturally Adapted Agricultural Loan",
        description: "We respect traditional planting and harvest cycles",
        paymentOptions: ["Payment at harvest end", "Quarterly payments", "Payments according to lunar calendar"],
        culturalNote: "This loan considers the 'ayni' principle and natural cycles"
      },
      qu: {
        title: "Chakra Llamkaypa Qolqe Mañakuynin",
        description: "Tarpuypa, pallay mit'apa respetaykuku",
        paymentOptions: ["Pallaypi tukuchispa qoy", "Kimsa killapi qoy", "Killa rikurisqanman hina qoy"],
        culturalNote: "Kay qolqe mañakuyqa ayni principiota, pachamamapa mit'ankunatapas qawan"
      }
    },
    business: {
      es: {
        title: "Préstamo para Emprendimiento Comunitario",
        description: "Apoyamos negocios que fortalecen la comunidad",
        paymentOptions: ["Pagos flexibles según ingresos", "Pagos mensuales", "Pagos estacionales"],
        culturalNote: "Basado en los principios de reciprocidad y desarrollo comunitario"
      },
      en: {
        title: "Community Entrepreneurship Loan",
        description: "We support businesses that strengthen the community",
        paymentOptions: ["Flexible payments according to income", "Monthly payments", "Seasonal payments"],
        culturalNote: "Based on principles of reciprocity and community development"
      },
      qu: {
        title: "Ayllu Ranqhaypa Qolqe Mañakuynin",
        description: "Aylluta kallpachaq negociokunata yanapakuyku",
        paymentOptions: ["Chaninchana qolqeman hina qoy", "Killapi qoy", "Mit'ankunapi qoy"],
        culturalNote: "Ayni, ayllu wiñaypa principionkunapi sayasqa"
      }
    }
  };

  // Calcular préstamo con consideraciones culturales
  const calculateLoan = () => {
    if (!loanData.amount || !loanData.term) return;

    const principal = parseFloat(loanData.amount);
    const months = parseInt(loanData.term);
    
    // Tasa de interés diferenciada por propósito cultural
    let interestRate = 0.12; // 12% anual base
    
    if (loanData.purpose === 'agriculture') {
      interestRate = 0.08; // 8% para agricultura (apoyo al sector primario)
    } else if (loanData.purpose === 'education') {
      interestRate = 0.06; // 6% para educación (inversión social)
    } else if (loanData.culturalConsiderations) {
      interestRate = 0.10; // 10% con consideraciones culturales
    }

    const monthlyRate = interestRate / 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1);

    setCalculation({
      principal,
      monthlyPayment,
      totalPayment: monthlyPayment * months,
      totalInterest: (monthlyPayment * months) - principal,
      interestRate: interestRate * 100
    });

    // Establecer información cultural
    if (culturalData[loanData.purpose]) {
      setCulturalInfo(culturalData[loanData.purpose]);
    }
  };

  useEffect(() => {
    calculateLoan();
  }, [loanData]);

  return (
    <div className="cultural-loan-calculator" style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#2c5f41',
        marginBottom: '30px',
        fontSize: '28px'
      }}>
        {t('loans.calculator')} - {t('cultural.cultural_respect')}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Formulario */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#2c5f41', marginBottom: '20px' }}>
            {t('loans.apply')}
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              {t('loans.amount')} (S/.)
            </label>
            <input
              type="number"
              value={loanData.amount}
              onChange={(e) => setLoanData({...loanData, amount: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
              placeholder="10000"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              {t('loans.term')} ({t('common.loading').replace('...', 'meses')})
            </label>
            <input
              type="number"
              value={loanData.term}
              onChange={(e) => setLoanData({...loanData, term: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
              placeholder="12"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              {t('loans.purpose')}
            </label>
            <select
              value={loanData.purpose}
              onChange={(e) => setLoanData({...loanData, purpose: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            >
              <option value="">{t('common.search')}...</option>
              <option value="agriculture">{t('loans.purpose_options.agriculture')}</option>
              <option value="business">{t('loans.purpose_options.business')}</option>
              <option value="education">{t('loans.purpose_options.education')}</option>
              <option value="health">{t('loans.purpose_options.health')}</option>
              <option value="housing">{t('loans.purpose_options.housing')}</option>
              <option value="emergency">{t('loans.purpose_options.emergency')}</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={loanData.culturalConsiderations}
                onChange={(e) => setLoanData({...loanData, culturalConsiderations: e.target.checked})}
              />
              <span style={{ fontSize: '14px' }}>
                {t('cultural.cultural_respect')} - {t('cultural.ayni_principle')}
              </span>
            </label>
          </div>
        </div>

        {/* Resultados */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#2c5f41', marginBottom: '20px' }}>
            Resultados del Cálculo
          </h3>
          
          {calculation && (
            <div>
              <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
                <strong>Monto del Préstamo:</strong> S/. {calculation.principal.toLocaleString()}
              </div>
              <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
                <strong>Tasa de Interés:</strong> {calculation.interestRate.toFixed(2)}% anual
              </div>
              <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
                <strong>Pago Mensual:</strong> S/. {calculation.monthlyPayment.toFixed(2)}
              </div>
              <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '5px' }}>
                <strong>Total a Pagar:</strong> S/. {calculation.totalPayment.toFixed(2)}
              </div>
              <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#d1ecf1', borderRadius: '5px' }}>
                <strong>Total Intereses:</strong> S/. {calculation.totalInterest.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información Cultural */}
      {culturalInfo && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          border: '2px solid #28a745' 
        }}>
          <h3 style={{ color: '#2c5f41', marginBottom: '15px' }}>
            🌿 Consideraciones Culturales
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: '#28a745' }}>{culturalInfo.es.title}</h4>
            <p style={{ margin: '10px 0', fontStyle: 'italic' }}>
              {culturalInfo.es.description}
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h5>Opciones de Pago Culturalmente Adaptadas:</h5>
            <ul style={{ paddingLeft: '20px' }}>
              {culturalInfo.es.paymentOptions.map((option, index) => (
                <li key={index} style={{ margin: '5px 0' }}>{option}</li>
              ))}
            </ul>
          </div>

          <div style={{ 
            padding: '15px', 
            backgroundColor: '#d4edda', 
            borderRadius: '5px',
            borderLeft: '4px solid #28a745'
          }}>
            <strong>Nota Cultural:</strong> {culturalInfo.es.culturalNote}
          </div>
        </div>
      )}

      {/* Principios de Interculturalidad */}
      <div style={{ 
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #17a2b8'
      }}>
        <h3 style={{ color: '#17a2b8', marginBottom: '15px' }}>
          🤝 Principios de Nuestro Sistema Intercultural
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
            <h4>{t('cultural.ayni_principle')}</h4>
            <p style={{ fontSize: '14px' }}>Reciprocidad y ayuda mutua</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🌱</div>
            <h4>{t('cultural.seasonal_calendar')}</h4>
            <p style={{ fontSize: '14px' }}>Respeto a ciclos naturales</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>👥</div>
            <h4>{t('cultural.community_support')}</h4>
            <p style={{ fontSize: '14px' }}>Fortalecimiento comunitario</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏛️</div>
            <h4>{t('cultural.indigenous_rights')}</h4>
            <p style={{ fontSize: '14px' }}>Respeto a derechos ancestrales</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CulturalLoanCalculator;
