import { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/router";
import { FaMoneyBillWave, FaPercentage, FaCalendarAlt, FaArrowRight, FaCheck, FaChartLine, FaInfoCircle } from 'react-icons/fa';
import Sidebar from '../../../components/Sidebar';
import styles from '../../styles/SolicitarPrestamo.module.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../utils/translations';
import CulturalCalculator from '../../components/CulturalCalculator';

const SolicitarPrestamo = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [role, setRole] = useState<'administrador' | 'cliente' | null>(null);
  const [monto, setMonto] = useState<number>(0);
  const [tasa, setTasa] = useState<number>(0);
  const [plazo, setPlazo] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cuotaEstimada, setCuotaEstimada] = useState<number>(0);
  
  // Referencias para animaciones interactivas
  const formCardRef = useRef<HTMLDivElement>(null);
  const montoInputRef = useRef<HTMLInputElement>(null);
  const tasaInputRef = useRef<HTMLInputElement>(null);
  const plazoInputRef = useRef<HTMLInputElement>(null);

  // Estado para la calculadora cultural
  const [showCulturalCalculator, setShowCulturalCalculator] = useState(false);
  const [culturalCalculationResult, setCulturalCalculationResult] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('token')) {
        router.push('/login');
      } else {
        const storedRole = localStorage.getItem('role') as 'administrador' | 'cliente';
        setRole(storedRole);
      }
    }
  }, [router]);
  
  // Efecto para mover suavemente la tarjeta en respuesta al cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!formCardRef.current) return;
      
      const { left, top, width, height } = formCardRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      formCardRef.current.style.transform = `
        perspective(1000px) 
        rotateX(${y * 2}deg) 
        rotateY(${x * -2}deg) 
        translateZ(10px)
      `;
    };
    
    const handleMouseLeave = () => {
      if (!formCardRef.current) return;
      formCardRef.current.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        translateZ(0)
        translateY(-8px)
      `;
    };
    
    const card = formCardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);
  
  // Calcular cuota estimada
  useEffect(() => {
    if (monto > 0 && tasa > 0 && plazo > 0) {
      const tasaMensual = (tasa / 100) / 12;
      const cuota = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo));
      setCuotaEstimada(Number(cuota.toFixed(2)));
    } else {
      setCuotaEstimada(0);
    }
  }, [monto, tasa, plazo]);
  
  // Efecto para crear partículas de fondo
  useEffect(() => {
    const createParticles = () => {
      const container = document.querySelector(`.${styles.pageContainer}`);
      if (!container) return;
      
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Estilos en línea para evitar conflictos con CSS modular
        particle.style.position = 'absolute';
        particle.style.width = `${Math.random() * 10 + 5}px`;
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(96, 165, 250, 0.1)';
        particle.style.borderRadius = '50%';
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animation = `float ${Math.random() * 5 + 3}s linear infinite`;
        particle.style.zIndex = '0';
        
        container.appendChild(particle);
      }
    };
    
    createParticles();
    return () => {
      const particles = document.querySelectorAll('.particle');
      particles.forEach(p => p.remove());
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    // Añadir efecto visual al botón
    const btn = e.currentTarget as HTMLButtonElement;
    btn.classList.add(styles.buttonSubmitting);

    try {
      if (monto <= 0 || tasa <= 0 || plazo <= 0) {
        setError("Por favor, ingrese valores válidos.");
        setLoading(false);
        btn.classList.remove(styles.buttonSubmitting);
        return;
      }

      const res = await fetch("http://localhost:3002/api/prestamos/solicitar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ monto, tasa, plazo }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al solicitar el préstamo.");
      }

      setSuccessMessage("¡Préstamo solicitado con éxito! Redirigiendo...");
      setLoading(false);
      btn.classList.remove(styles.buttonSubmitting);
      
      // Añadir efecto de confeti
      createConfetti();

      // Redirigir después de un breve tiempo
      setTimeout(() => {
        router.push("/cliente/DetallePrestamo");
      }, 2000);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      btn.classList.remove(styles.buttonSubmitting);
    }
  };
  
  // Función para crear efecto de confeti
  const createConfetti = () => {
    const container = document.querySelector(`.${styles.formCard}`);
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.background = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb'][Math.floor(Math.random() * 4)];
      confetti.style.top = '50%';
      confetti.style.left = '50%';
      confetti.style.opacity = '0';
      confetti.style.zIndex = '10';
      confetti.style.borderRadius = `${Math.random() > 0.5 ? '50%' : '0'}`;
      
      // Animación personalizada
      confetti.animate([
        { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
        { 
          transform: `translate(${(Math.random() - 0.5) * 500}%, ${(Math.random() - 0.5) * 500}%) rotate(${Math.random() * 360}deg)`,
          opacity: 0 
        }
      ], {
        duration: 1000 + Math.random() * 1000,
        easing: 'cubic-bezier(0,.9,.57,1)'
      });
      
      container.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
    }
  };

  const handleCulturalCalculationResult = (result: any) => {
    setCulturalCalculationResult(result);
    // Auto-llenar el formulario con los datos de la calculadora cultural
    if (result.calculation) {
      setMonto(result.calculation.principal);
    }
  };

  // Si no se ha cargado el rol, mostrar mensaje de carga mejorado
  if (!role) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer || ''}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando su información financiera...</p>
          <div className={styles.loadingDots || ''}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar role={role} />
      <div className={styles.contentContainer}>
        <div className={styles.container}>
          <h1 className={styles.title}>{t('nav.solicitar_prestamo') || 'Solicitar Préstamo'}</h1>
          
          {/* Opción de usar calculadora cultural */}
          <div className={styles.culturalOption}>
            <button
              type="button"
              className={`${styles.culturalToggleButton} ${showCulturalCalculator ? styles.active : ''}`}
              onClick={() => setShowCulturalCalculator(!showCulturalCalculator)}
            >
              <FaChartLine />
              {showCulturalCalculator ? 'Ocultar Calculadora Cultural' : 'Usar Calculadora Cultural'}
            </button>
            <p className={styles.culturalOptionDescription}>
              {language === 'qu' ? 
                'Culturanchispa yupanawan aswan allin chaniyuq qullqita tarisun' :
                language === 'en' ?
                'Use our cultural calculator for better rates based on your cultural context' :
                'Usa nuestra calculadora cultural para obtener mejores tasas según tu contexto cultural'
              }
            </p>
          </div>

          {/* Calculadora Cultural */}
          {showCulturalCalculator && (
            <div className={styles.culturalCalculatorSection}>
              <CulturalCalculator onCalculationResult={handleCulturalCalculationResult} />
            </div>
          )}

          {/* Resultado de calculadora cultural */}
          {culturalCalculationResult && (
            <div className={styles.culturalResultCard}>
              <h3>Resultado de Cálculo Cultural</h3>
              <div className={styles.culturalResultGrid}>
                <div className={styles.culturalResultItem}>
                  <span>Cuota Mensual:</span>
                  <span>S/ {culturalCalculationResult.calculation.monthlyPayment.toFixed(2)}</span>
                </div>
                <div className={styles.culturalResultItem}>
                  <span>Tasa de Interés:</span>
                  <span>{culturalCalculationResult.calculation.interestRate.toFixed(2)}%</span>
                </div>
              </div>
              {culturalCalculationResult.culturalInfo && (
                <div className={styles.culturalInfoBanner}>
                  <FaInfoCircle />
                  <span>{culturalCalculationResult.culturalInfo.culturalNote}</span>
                </div>
              )}
            </div>
          )}

          <div className={styles.formCard} ref={formCardRef}>
            <h1 className={styles.title}>Solicitar un Préstamo</h1>
            
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className={styles.successMessage}>
                <FaCheck className={styles.successIcon} />
                {successMessage}
              </div>
            )}
            
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="monto" className={styles.label}>
                  Monto
                  <FaMoneyBillWave className={styles.labelIcon} />
                </label>
                <div className={styles.inputGroup}>
                  <input
                    ref={montoInputRef}
                    type="number"
                    id="monto"
                    className={styles.input}
                    value={monto}
                    onChange={(e) => setMonto(Number(e.target.value))}
                    placeholder="Ingrese el monto solicitado"
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="tasa" className={styles.label}>
                  Tasa de Interés (%)
                  <FaPercentage className={styles.labelIcon} />
                </label>
                <div className={styles.inputGroup}>
                  <input
                    ref={tasaInputRef}
                    type="number"
                    id="tasa"
                    className={styles.input}
                    value={tasa}
                    onChange={(e) => setTasa(Number(e.target.value))}
                    placeholder="Ingrese la tasa de interés anual"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="plazo" className={styles.label}>
                  Plazo (en meses)
                  <FaCalendarAlt className={styles.labelIcon} />
                </label>
                <div className={styles.inputGroup}>
                  <input
                    ref={plazoInputRef}
                    type="number"
                    id="plazo"
                    className={styles.input}
                    value={plazo}
                    onChange={(e) => setPlazo(Number(e.target.value))}
                    placeholder="Ingrese el plazo en meses"
                    required
                  />
                </div>
              </div>
              
              {cuotaEstimada > 0 && (
                <div className={styles.simulatorCard}>
                  <h3 className={styles.simulatorTitle}>
                    <FaChartLine style={{ marginRight: '8px' }} /> 
                    Simulador de Cuotas
                  </h3>
                  <div className={styles.simulatorResult}>
                    <span className={styles.simulatorText}>Su cuota mensual estimada será:</span>
                    <span className={styles.simulatorAmount}>${cuotaEstimada}</span>
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                className={styles.submitButton} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.loadingSpinner}></span>
                    <span>Procesando solicitud...</span>
                  </>
                ) : (
                  <>
                    <span>Solicitar Préstamo</span>
                    <FaArrowRight className={styles.buttonIcon} />
                  </>
                )}
              </button>
              
              <p className={styles.infoNote}>
                <FaInfoCircle style={{ marginRight: '5px', fontSize: '12px' }} />
                Al solicitar un préstamo, acepta nuestros términos y condiciones.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitarPrestamo;