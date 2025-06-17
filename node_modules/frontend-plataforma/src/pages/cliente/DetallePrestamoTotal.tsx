import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FaIdCard, FaCalendarAlt, FaMoneyBillWave, 
  FaPercentage, FaClock, FaReceipt, FaInfoCircle,
  FaChartLine, FaExclamationTriangle
} from 'react-icons/fa';
import Sidebar from '../../../components/Sidebar';
import styles from '../../styles/DetallePrestamoTotal.module.css';

interface Prestamo {
  id: number;
  fecha_inicio: string;
  monto: number;
  tasa: number;
  plazo: number;
  cuota_mensual: number;
  estado: string;
  total_pagar: number;
  interes_total: number;
}

export default function DetallePrestamoTotal() {
  const router = useRouter();
  const { prestamoId } = router.query;
  const [prestamo, setPrestamo] = useState<Prestamo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'administrador' | 'cliente' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'detalles' | 'amortizacion'>('detalles');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role') as 'administrador' | 'cliente';

      if (!token) {
        router.push('/login');
        return;
      }

      setRole(role);

      const fetchPrestamo = async () => {
        try {
          setLoading(true);
          const res = await fetch(`http://localhost:3002/api/prestamos/${prestamoId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error('Error al obtener el préstamo');
          }

          const data = await res.json();
          
          // Calculamos el total a pagar y el interés total
          const totalPagar = data.cuota_mensual * data.plazo;
          const interesPagado = totalPagar - data.monto;
          
          setPrestamo({
            ...data,
            total_pagar: totalPagar,
            interes_total: interesPagado
          });
          
        } catch (error: any) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      if (prestamoId) {
        fetchPrestamo();
      }
    }
  }, [router, prestamoId]);

  const calcularTablaAmortizacion = () => {
    if (!prestamo) return [];
    
    const tabla = [];
    let saldoPendiente = prestamo.monto;
    const tasaMensual = (prestamo.tasa / 100) / 12;
    
    for (let i = 1; i <= prestamo.plazo; i++) {
      const interesMensual = saldoPendiente * tasaMensual;
      const capitalAmortizado = prestamo.cuota_mensual - interesMensual;
      saldoPendiente -= capitalAmortizado;
      
      tabla.push({
        periodo: i,
        cuota: prestamo.cuota_mensual,
        capital: capitalAmortizado,
        interes: interesMensual,
        saldo: saldoPendiente > 0 ? saldoPendiente : 0
      });
    }
    
    return tabla;
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

  const getStatusClass = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
      case 'aprobado':
        return styles.statusApproved;
      case 'pendiente':
      case 'en_revision':
        return styles.statusPending;
      case 'rechazado':
        return styles.statusRejected;
      case 'finalizado':
        return styles.statusCompleted;
      default:
        return '';
    }
  };

  return (
    <div className={styles.detallePrestamoTotalContainer}>
      {role && <Sidebar role={role} />}
      <div className={styles.contentContainer}>
        <h1 className={styles.title}>
          <FaMoneyBillWave className={styles.titleIcon} />
          Detalle del Préstamo
        </h1>
        
        {error && (
          <div className={styles.errorMessage}>
            <FaExclamationTriangle />
            {error}
          </div>
        )}
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Cargando información del préstamo...</p>
          </div>
        ) : prestamo ? (
          <>
            <div className={styles.cardHeader}>
              <div className={styles.loanIdSection}>
                <span className={styles.loanIdLabel}>Préstamo #{prestamo.id}</span>
                <span className={`${styles.statusBadge} ${getStatusClass(prestamo.estado)}`}>
                  {prestamo.estado.replace(/_/g, ' ')}
                </span>
              </div>
              <div className={styles.dateSection}>
                <FaCalendarAlt />
                <span>Fecha de inicio: {formatDate(prestamo.fecha_inicio)}</span>
              </div>
            </div>
            
            <div className={styles.tabsContainer}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'detalles' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('detalles')}
              >
                <FaInfoCircle />
                Detalles del Préstamo
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'amortizacion' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('amortizacion')}
              >
                <FaChartLine />
                Tabla de Amortización
              </button>
            </div>
            
            {activeTab === 'detalles' ? (
              <>
                <div className={styles.summaryCards}>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryIconContainer}>
                      <FaMoneyBillWave className={styles.summaryIcon} />
                    </div>
                    <div className={styles.summaryContent}>
                      <h3>Monto Solicitado</h3>
                      <p className={styles.summaryValue}>{formatCurrency(prestamo.monto)}</p>
                    </div>
                  </div>
                  
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryIconContainer}>
                      <FaReceipt className={styles.summaryIcon} />
                    </div>
                    <div className={styles.summaryContent}>
                      <h3>Cuota Mensual</h3>
                      <p className={styles.summaryValue}>{formatCurrency(prestamo.cuota_mensual)}</p>
                    </div>
                  </div>
                  
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryIconContainer}>
                      <FaClock className={styles.summaryIcon} />
                    </div>
                    <div className={styles.summaryContent}>
                      <h3>Plazo</h3>
                      <p className={styles.summaryValue}>{prestamo.plazo} meses</p>
                    </div>
                  </div>
                </div>
                
                <div className={styles.detailCard}>
                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>
                      <FaPercentage />
                      <span>Tasa de Interés</span>
                    </div>
                    <div className={styles.detailValue}>{prestamo.tasa}% anual</div>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>
                      <FaMoneyBillWave />
                      <span>Total a Pagar</span>
                    </div>
                    <div className={styles.detailValue}>{formatCurrency(prestamo.total_pagar)}</div>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>
                      <FaMoneyBillWave />
                      <span>Interés Total</span>
                    </div>
                    <div className={styles.detailValue}>{formatCurrency(prestamo.interes_total)}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.amortizationTable}>
                <div className={styles.tableResponsive}>
                  <table>
                    <thead>
                      <tr>
                        <th>Mes</th>
                        <th>Cuota</th>
                        <th>Capital</th>
                        <th>Interés</th>
                        <th>Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calcularTablaAmortizacion().map((fila, index) => (
                        <tr key={index}>
                          <td>{fila.periodo}</td>
                          <td>{formatCurrency(fila.cuota)}</td>
                          <td>{formatCurrency(fila.capital)}</td>
                          <td>{formatCurrency(fila.interes)}</td>
                          <td>{formatCurrency(fila.saldo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className={styles.noDataMessage}>No se encontró información del préstamo</p>
        )}
      </div>
    </div>
  );
}