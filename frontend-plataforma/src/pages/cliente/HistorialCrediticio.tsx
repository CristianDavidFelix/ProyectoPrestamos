import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
    FaChartLine,
    FaHistory,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle,
    FaFileDownload,
    FaExclamationCircle,
    FaFileInvoice,
    FaIdCard,
    FaCalendarAlt,
    FaHandHoldingUsd,
    FaMoneyBillWave,
    FaPrint
} from 'react-icons/fa';
import Sidebar from '../../../components/Sidebar';
import styles from '../../styles/HistorialCrediticio.module.css';

interface CreditHistory {
    id: string;
    descripcion: string;
    puntaje_crediticio: number;
    fecha: string;
    tipo_transaccion?: string;
    entidad?: string;

    estado?: string;
    referencia?: string;
}

interface CreditScore {
    score: number;
    max_score: number;
    nivel: 'Excelente' | 'Bueno' | 'Regular' | 'Bajo' | 'Muy Bajo';
    porcentaje: number;
}

export default function HistorialCrediticio() {
    const router = useRouter();
    const [creditHistory, setCreditHistory] = useState<CreditHistory[] | null>(null);
    const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<'administrador' | 'cliente' | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'resumen' | 'historial' | 'recomendaciones'>('resumen');
    const [selectedPeriod, setSelectedPeriod] = useState<'6M' | '1Y' | '2Y' | 'ALL'>('1Y');
    const scoreCircleRef = useRef<SVGCircleElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role') as 'administrador' | 'cliente';
            const id_usuario = localStorage.getItem('id_usuario');

            if (!token) {
                router.push('/login');
                return;
            }

            setRole(role);

            const fetchUserData = async () => {
                try {
                    const res = await fetch(`http://localhost:3001/api/usuarios/${id_usuario}/historial-crediticio`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (!res.ok) {
                        throw new Error('Error al obtener datos del usuario');
                    }

                    const data = await res.json();
                    setUserData(data);
                } catch (error: any) {
                    console.error("Error fetching user data:", error);
                }
            };

            const fetchCreditHistory = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`http://localhost:3001/api/usuarios/${id_usuario}/historial-crediticio`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (!res.ok) {
                        throw new Error('Error al obtener el historial crediticio');
                    }

                    const data = await res.json();

                    // Enriquecer los datos con información adicional para simular un historial más completo
                    const enhancedData = data.map((item: CreditHistory) => ({
                        ...item,
                        tipo_transaccion: getTipoTransaccion(item.descripcion),
                        entidad: getEntidad(item.descripcion),
            
                        estado: getEstado(item.puntaje_crediticio),
                        referencia: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
                    }));

                    setCreditHistory(enhancedData);

                    // Calcular el puntaje crediticio promedio
                    if (enhancedData.length > 0) {
                        const totalScore = enhancedData.reduce((sum: number, item: CreditHistory) => sum + item.puntaje_crediticio, 0);
                        const averageScore = Math.round(totalScore / enhancedData.length);
                        const nivel = getNivelCredito(averageScore);

                        setCreditScore({
                            score: averageScore,
                            max_score: 850,
                            nivel,
                            porcentaje: (averageScore / 850) * 100
                        });

                        // Animar el círculo de puntaje
                       setTimeout(() => {
    if (scoreCircleRef.current) {
        scoreCircleRef.current.style.strokeDashoffset = `${630 - (630 * (averageScore / 850))}`;
    }
}, 100);
                    }
                } catch (error: any) {
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };

            Promise.all([fetchUserData(), fetchCreditHistory()]);
        }
    }, [router]);

    // Funciones de ayuda para enriquecer los datos
    const getTipoTransaccion = (descripcion: string): string => {
        const tipos = ['Préstamo Personal', 'Crédito Hipotecario', 'Tarjeta de Crédito', 'Pago de Cuota', 'Consulta', 'Actualización'];
        return descripcion.includes('préstamo') ? 'Préstamo Personal' :
            descripcion.includes('pago') ? 'Pago de Cuota' :
                tipos[Math.floor(Math.random() * tipos.length)];
    };

    const getEntidad = (descripcion: string): string => {
        const entidades = ['Banco Nacional', 'Cooperativa Financiera', 'Financiera Confianza', 'Caja Rural', 'BancoEstado', 'Entidad Reguladora'];
        return entidades[Math.floor(Math.random() * entidades.length)];
    };

  
    const getEstado = (puntaje: number): string => {
        return puntaje > 700 ? 'Positivo' : puntaje > 500 ? 'Neutral' : 'Negativo';
    };

    const getNivelCredito = (score: number): CreditScore['nivel'] => {
        if (score >= 750) return 'Excelente';
        if (score >= 670) return 'Bueno';
        if (score >= 580) return 'Regular';
        if (score >= 500) return 'Bajo';
        return 'Muy Bajo';
    };

    const getScoreColorClass = (nivel: CreditScore['nivel']): string => {
        switch (nivel) {
            case 'Excelente': return styles.scoreExcellent;
            case 'Bueno': return styles.scoreGood;
            case 'Regular': return styles.scoreAverage;
            case 'Bajo': return styles.scorePoor;
            case 'Muy Bajo': return styles.scoreVeryPoor;
            default: return '';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusIcon = (estado: string) => {
        switch (estado) {
            case 'Positivo': return <FaCheckCircle className={`${styles.statusIcon} ${styles.statusPositive}`} />;
            case 'Neutral': return <FaInfoCircle className={`${styles.statusIcon} ${styles.statusNeutral}`} />;
            case 'Negativo': return <FaTimesCircle className={`${styles.statusIcon} ${styles.statusNegative}`} />;
            default: return null;
        }
    };

    const printReport = () => {
        window.print();
    };

    const downloadPDF = () => {
        alert("Descargando reporte crediticio en PDF...");
        // Aquí iría la lógica real para generar y descargar un PDF
    };

    const getRecomendaciones = (): string[] => {
        if (!creditScore) return [];

        const score = creditScore.score;

        if (score >= 750) {
            return [
                "Su historial crediticio es excelente, califica para las mejores tasas de interés.",
                "Considere inversiones a largo plazo con su buen respaldo crediticio.",
                "Mantenga sus hábitos financieros actuales para preservar su excelente puntaje."
            ];
        } else if (score >= 670) {
            return [
                "Su historial crediticio es bueno, califica para tasas competitivas.",
                "Reducir deudas de tarjetas de crédito puede mejorar aún más su puntaje.",
                "Evite solicitar múltiples créditos en periodos cortos de tiempo."
            ];
        } else if (score >= 580) {
            return [
                "Su historial crediticio es regular, puede acceder a financiamiento con tasas estándar.",
                "Pague sus deudas a tiempo y reduzca el saldo de sus tarjetas de crédito.",
                "Evite cerrar cuentas antiguas que contribuyen positivamente a su historial."
            ];
        } else {
            return [
                "Su puntaje crediticio necesita mejoras para acceder a mejores condiciones financieras.",
                "Asegúrese de pagar todas sus obligaciones a tiempo y ponerse al día con pagos atrasados.",
                "Considere solicitar una tarjeta de crédito segura para comenzar a construir historial positivo.",
                "Reduzca su nivel de endeudamiento por debajo del 30% de su límite disponible."
            ];
        }
    };

    if (loading) {
        return (
            <div className={styles.historialCrediticioContainer}>
                {role && <Sidebar role={role} />}
                <div className={styles.contentContainer}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Consultando su historial crediticio...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.historialCrediticioContainer}>
            {role && <Sidebar role={role} />}
            <div className={styles.contentContainer}>
                <div className={styles.headerSection}>
                    <h1 className={styles.title}>
                        <FaChartLine className={styles.titleIcon} />
                        Historial Crediticio
                    </h1>
                    <div className={styles.reportActions}>
                        <button className={styles.actionButton} onClick={printReport}>
                            <FaPrint />
                            <span>Imprimir</span>
                        </button>
                        <button className={styles.actionButton} onClick={downloadPDF}>
                            <FaFileDownload />
                            <span>Descargar PDF</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        <FaExclamationTriangle />
                        <span>{error}</span>
                    </div>
                )}

                <div className={styles.reportContainer}>
                    <div className={styles.reportHeader}>
                        <div className={styles.reportLogo}>
                            <FaFileInvoice className={styles.logoIcon} />
                            <span>BancoSistema</span>
                        </div>
                        <div className={styles.reportInfo}>
                            <div className={styles.reportInfoItem}>
                                <FaIdCard />
                                <span>Informe Crediticio #{Math.floor(Math.random() * 10000000)}</span>
                            </div>
                            <div className={styles.reportInfoItem}>
                                <FaCalendarAlt />
                                <span>Generado: {new Date().toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </div>
                        </div>
                    </div>

                    

                    <div className={styles.tabsContainer}>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'resumen' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('resumen')}
                        >
                            <FaChartLine />
                            <span>Resumen</span>
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'historial' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('historial')}
                        >
                            <FaHistory />
                            <span>Historial Detallado</span>
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'recomendaciones' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('recomendaciones')}
                        >
                            <FaInfoCircle />
                            <span>Recomendaciones</span>
                        </button>
                    </div>

                    {activeTab === 'resumen' && creditScore && (
                        <div className={styles.scoreSection}>
                            <div className={styles.scoreOverview}>
                                <div className={styles.scoreCircleContainer}>
                                    <svg width="220" height="220" viewBox="0 0 220 220">
                                        <circle cx="110" cy="110" r="100" fill="none" stroke="#e6e6e6" strokeWidth="20" />
                                        <circle
                                            ref={scoreCircleRef}
                                            cx="110"
                                            cy="110"
                                            r="100"
                                            fill="none"
                                            stroke="url(#scoreGradient)"
                                            strokeWidth="20"
                                            strokeDasharray="630"
                                            strokeDashoffset="630"
                                            strokeLinecap="round"
                                            transform="rotate(-90 110 110)"
                                        />
                                        <defs>
                                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#ff5757" />
                                                <stop offset="25%" stopColor="#ffbd59" />
                                                <stop offset="50%" stopColor="#f7e360" />
                                                <stop offset="75%" stopColor="#96d265" />
                                                <stop offset="100%" stopColor="#35a768" />
                                            </linearGradient>
                                        </defs>
                                        <text x="110" y="105" textAnchor="middle" fill="#333" fontSize="42" fontWeight="bold">
                                            {creditScore.score}
                                        </text>
                                        <text x="110" y="135" textAnchor="middle" fill="#666" fontSize="16">
                                            de {creditScore.max_score}
                                        </text>
                                    </svg>
                                </div>

                                <div className={styles.scoreDetails}>
                                    <h3>Su Puntaje Crediticio</h3>
                                    <div className={`${styles.scoreLevel} ${getScoreColorClass(creditScore.nivel)}`}>
                                        {creditScore.nivel}
                                    </div>
                                    <p className={styles.scoreDescription}>
                                        Su puntaje crediticio es <strong>{creditScore.nivel.toLowerCase()}</strong>,
                                        lo que indica {creditScore.nivel === 'Excelente' || creditScore.nivel === 'Bueno'
                                            ? 'que tiene buenas probabilidades de aprobación para la mayoría de los productos financieros.'
                                            : 'que podría enfrentar algunas limitaciones al solicitar ciertos productos financieros.'}
                                    </p>

                                    <div className={styles.scaleContainer}>
                                        <div className={styles.scale}>
                                            <div className={styles.scaleSegment} style={{ backgroundColor: '#ff5757' }}></div>
                                            <div className={styles.scaleSegment} style={{ backgroundColor: '#ffbd59' }}></div>
                                            <div className={styles.scaleSegment} style={{ backgroundColor: '#f7e360' }}></div>
                                            <div className={styles.scaleSegment} style={{ backgroundColor: '#96d265' }}></div>
                                            <div className={styles.scaleSegment} style={{ backgroundColor: '#35a768' }}></div>
                                        </div>
                                        <div className={styles.scaleLabels}>
                                            <span>300</span>
                                            <span>500</span>
                                            <span>670</span>
                                            <span>750</span>
                                            <span>850</span>
                                        </div>
                                        <div className={styles.scaleIndicator} style={{ left: `${(creditScore.score - 300) / 5.5}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'historial' && (
                        <div className={styles.historialSection}>
                            <div className={styles.historialHeader}>
                                <h3>Historial de Transacciones Crediticias</h3>
                                <div className={styles.periodSelector}>
                                    <button
                                        className={selectedPeriod === '6M' ? styles.activePeriod : ''}
                                        onClick={() => setSelectedPeriod('6M')}
                                    >
                                        6 Meses
                                    </button>
                                    <button
                                        className={selectedPeriod === '1Y' ? styles.activePeriod : ''}
                                        onClick={() => setSelectedPeriod('1Y')}
                                    >
                                        1 Año
                                    </button>
                                    <button
                                        className={selectedPeriod === '2Y' ? styles.activePeriod : ''}
                                        onClick={() => setSelectedPeriod('2Y')}
                                    >
                                        2 Años
                                    </button>
                                    <button
                                        className={selectedPeriod === 'ALL' ? styles.activePeriod : ''}
                                        onClick={() => setSelectedPeriod('ALL')}
                                    >
                                        Todo
                                    </button>
                                </div>
                            </div>

                            {creditHistory && creditHistory.length > 0 ? (
                                <div className={styles.historialTable}>
                                    <div className={styles.tableHeader}>
                                        <div className={styles.tableCell}>Fecha</div>
                                        <div className={styles.tableCell}>Descripción</div>
                                        <div className={styles.tableCell}>Entidad</div>
                                        <div className={styles.tableCell}>Tipo</div>
                                      
                                        <div className={styles.tableCell}>Puntaje</div>
                                        <div className={styles.tableCell}>Estado</div>
                                        <div className={styles.tableCell}>Referencia</div>
                                    </div>

                                    {creditHistory.map((history) => (
                                        <div key={history.id} className={styles.tableRow}>
                                            <div className={styles.tableCell}>{formatDate(history.fecha)}</div>
                                            <div className={styles.tableCell}>{history.descripcion}</div>
                                            <div className={styles.tableCell}>{history.entidad}</div>
                                            <div className={styles.tableCell}>{history.tipo_transaccion}</div>
                                            
                                            <div className={styles.tableCell}>{history.puntaje_crediticio}</div>
                                            <div className={styles.tableCell}>
                                                <div className={styles.statusContainer}>
                                                    {getStatusIcon(history.estado || '')}
                                                    <span>{history.estado}</span>
                                                </div>
                                            </div>
                                            <div className={styles.tableCell}>{history.referencia}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.noDataMessage}>
                                    <FaExclamationCircle />
                                    <p>No hay registros de historial crediticio en el período seleccionado.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'recomendaciones' && (
                        <div className={styles.recomendacionesSection}>
                            <div className={styles.recomendacionesHeader}>
                                <h3>Recomendaciones Personalizadas</h3>
                                <p>Basadas en su historial crediticio y comportamiento financiero</p>
                            </div>

                            <div className={styles.recomendacionesList}>
                                {getRecomendaciones().map((recomendacion, index) => (
                                    <div key={index} className={styles.recomendacionItem}>
                                        <div className={styles.recomendacionIcon}>
                                            <FaInfoCircle />
                                        </div>
                                        <p>{recomendacion}</p>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.disclaimerBox}>
                                <FaExclamationCircle className={styles.disclaimerIcon} />
                                <p>
                                    <strong>Aviso importante:</strong> Este informe es meramente informativo y no constituye una oferta
                                    de productos o servicios financieros. Las recomendaciones proporcionadas son sugerencias
                                    generales basadas en su historial crediticio y no deben considerarse como asesoramiento
                                    financiero personalizado. Para obtener asesoramiento adaptado a su situación particular,
                                    consulte con un asesor financiero profesional.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}