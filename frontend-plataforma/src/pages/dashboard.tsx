import Sidebar from '../../components/Sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaChartLine, FaMoneyBillWave, FaFileInvoiceDollar, FaCreditCard, FaHistory, FaInfoCircle, FaBell, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import styles from '../styles/dashboard.module.css';

const Dashboard = () => {
    const router = useRouter();
    const [role, setRole] = useState<'administrador' | 'cliente' | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!localStorage.getItem('token')) {
                router.push('/login');
            } else {
                const storedRole = localStorage.getItem('role') as 'administrador' | 'cliente';
                const storedName = localStorage.getItem('userName') || 'Usuario';
                setRole(storedRole);
                setUserName(storedName);
                setLoading(false);
            }
        }
    }, [router]);

    // Datos de ejemplo para el dashboard
    const metrics = {
        prestamos: role === 'administrador' ? 24 : 2,
        pagos: role === 'administrador' ? 156 : 8,
        pendientes: role === 'administrador' ? 12 : 1,
        totalMonto: role === 'administrador' ? '$1,245,000' : '$45,000'
    };

    // Actividad reciente (simulada)
    /*const recentActivity = [
        {
            id: 1,
            title: 'Préstamo #1234 aprobado',
            time: 'Hace 2 horas',
            status: 'approved',
            icon: <FaCheckCircle />
        },
        {
            id: 2,
            title: 'Nuevo pago recibido de $5,000',
            time: 'Hoy, 10:30 AM',
            status: 'approved',
            icon: <FaMoneyBillWave />
        },
        {
            id: 3,
            title: 'Solicitud de préstamo #2468 en revisión',
            time: 'Ayer',
            status: 'pending',
            icon: <FaHourglassHalf />
        },
        {
            id: 4,
            title: 'Préstamo #3579 rechazado',
            time: 'Hace 2 días',
            status: 'declined',
            icon: <FaTimesCircle />
        }
    ];*/

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>Cargando tu dashboard...</p>
            </div>
        );
    }

    // ... código existente ...

    return (
        <div className={styles.pageContainer}>
            <Sidebar role={role} />
            <div className={styles.contentContainer}>
                {/* Banner de bienvenida */}
                <div className={styles.welcomeBanner}>
                    <div className={styles.bannerContent}>
                        <h2 className={styles.bannerTitle}>
                            ¡Bienvenido a tu dashboard, {userName}!
                        </h2>
                        <p className={styles.bannerText}>
                            Este es tu centro de control para gestionar todos los servicios financieros.
                        </p>
                    </div>
                    <button
                        className={styles.bannerBtn}
                        onClick={() => role === 'administrador' ?
                            router.push('/admin/GestionarPrestamos') :
                            router.push('/cliente/SolicitarPrestamo')}
                    >
                        {role === 'administrador' ? 'Gestionar Préstamos' : 'Solicitar Préstamo'}
                    </button>
                </div>

                <h1 className={styles.welcomeHeader}>
                    Dashboard de {role === 'administrador' ? 'Administración' : 'Cliente'}
                </h1>

                <p className={styles.welcomeMessage}>
                    {role === 'administrador'
                        ? 'Desde aquí podrás gestionar todos los préstamos, revisar solicitudes pendientes, y monitorear el estado del sistema.'
                        : 'Desde aquí podrás visualizar y solicitar préstamos, realizar pagos y verificar tu historial crediticio de forma segura.'}
                </p>

                {/* Métricas clave - SOLO PARA ADMINISTRADORES */}
                {role === 'administrador' && (
                    <div className={styles.metricsContainer}>
                        <div className={styles.metricCard}>
                            <div className={styles.metricValue}>{metrics.prestamos}</div>
                            <div className={styles.metricLabel}>Préstamos Totales</div>
                        </div>
                        <div className={styles.metricCard}>
                            <div className={styles.metricValue}>{metrics.pagos}</div>
                            <div className={styles.metricLabel}>Pagos Realizados</div>
                        </div>
                        <div className={styles.metricCard}>
                            <div className={styles.metricValue}>{metrics.pendientes}</div>
                            <div className={styles.metricLabel}>Solicitudes Pendientes</div>
                        </div>
                        <div className={styles.metricCard}>
                            <div className={styles.metricValue}>{metrics.totalMonto}</div>
                            <div className={styles.metricLabel}>Monto Total</div>
                        </div>
                    </div>
                )}

                {/* Tarjetas de acceso rápido */}
                <div className={styles.cardsContainer}>
                    {role === 'administrador' ? (
                        <>
                            <div className={styles.card} onClick={() => router.push('/admin/GestionarPrestamos')}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}><FaFileInvoiceDollar /></div>
                                    <h3 className={styles.cardTitle}>Gestionar Préstamos</h3>
                                </div>
                                <p className={styles.cardContent}>
                                    Revisa y aprueba solicitudes de préstamos pendientes. Administra los préstamos activos.
                                </p>
                            </div>
                            <div className={styles.card} onClick={() => router.push('/admin/HistorialPagos')}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}><FaHistory /></div>
                                    <h3 className={styles.cardTitle}>Historial de Pagos</h3>
                                </div>
                                <p className={styles.cardContent}>
                                    Consulta todos los pagos realizados y verifica su estado y detalles.
                                </p>
                            </div>
                            <div className={styles.card} onClick={() => router.push('/admin/VerPerfilUsuario')}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}><FaInfoCircle /></div>
                                    <h3 className={styles.cardTitle}>Perfiles de Usuario</h3>
                                </div>
                                <p className={styles.cardContent}>
                                    Consulta y gestiona la información de los usuarios registrados en el sistema.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.card} onClick={() => router.push('/cliente/SolicitarPrestamo')}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}><FaMoneyBillWave /></div>
                                    <h3 className={styles.cardTitle}>Solicitar Préstamo</h3>
                                </div>
                                <p className={styles.cardContent}>
                                    Solicita un nuevo préstamo personalizado según tus necesidades financieras.
                                </p>
                            </div>
                            <div className={styles.card} onClick={() => router.push('/cliente/PagarCuotas')}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}><FaCreditCard /></div>
                                    <h3 className={styles.cardTitle}>Pagar Cuotas</h3>
                                </div>
                                <p className={styles.cardContent}>
                                    Realiza pagos de tus préstamos activos de manera segura y rápida.
                                </p>
                            </div>
                            <div className={styles.card} onClick={() => router.push('/cliente/HistorialCrediticio')}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}><FaChartLine /></div>
                                    <h3 className={styles.cardTitle}>Historial Crediticio</h3>
                                </div>
                                <p className={styles.cardContent}>
                                    Consulta tu historial crediticio y puntaje actual para mejores decisiones.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <div>© 2025 Plataforma de Préstamos Seguros</div>
                    <div className={styles.footerLinks}>
                        <a href="#">Términos y Condiciones</a>
                        <a href="#">Políticas de Privacidad</a>
                        <a href="#">Ayuda</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;