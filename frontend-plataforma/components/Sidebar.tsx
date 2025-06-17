import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FaUserCircle, FaSignOutAlt, FaChartLine, FaMoneyBillWave, 
  FaHistory, FaFileInvoiceDollar, FaUserEdit, FaUserShield,
  FaCreditCard, FaHandHoldingUsd, FaRegCreditCard, FaRegMoneyBillAlt,
  FaFileContract, FaBars
} from 'react-icons/fa';
import styles from '../src/styles/Sidebar.module.css';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useTranslation } from '../src/utils/translations';
import LanguageSelector from '../src/components/LanguageSelector';

interface SidebarProps {
    role: 'administrador' | 'cliente';
}

const Sidebar = ({ role }: SidebarProps) => {
    const router = useRouter();
    const { language } = useLanguage();
    const { t } = useTranslation(language);
    const [userName, setUserName] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(true);
    
    // Obtener la primera letra del nombre para mostrar en el avatar
    const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!localStorage.getItem('token')) {
                router.push('/login');
            } else {
                const storedUserName = localStorage.getItem('userName');
                setUserName(storedUserName);
            }
            
            // Cerrar sidebar en móviles por defecto
            const handleResize = () => {
                setIsOpen(window.innerWidth > 768);
            };
            
            handleResize();
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('role');
        router.push('/login');
    };

    // Verificar si el enlace está activo
    const isActive = (path: string) => {
        return router.pathname === path;
    };

    // Alternar la visibilidad del sidebar en móviles
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Botón toggle para móviles */}
            <button 
                className={styles.toggleButton} 
                onClick={toggleSidebar}
                style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
            >
                <FaBars />
            </button>
            
            {/* Sidebar principal */}
            <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div>
                    {/* Logo/Brand */}
                    <div className={styles.brand}>
                        <div className={styles.brandLogo}>Fintech App</div>
                    </div>
                    
                    {/* Sección del usuario */}
                    <div className={styles.usuario}>
                        <div className={styles.avatarContainer}>
                            <div className={styles.avatar}>
                                {userInitial}
                            </div>
                            <div className={styles.statusIndicator}></div>
                        </div>
                        {userName && <p>{userName}</p>}
                        <span className={styles.roleBadge}>
                            {role === 'administrador' ? 'Administrador' : 'Cliente'}
                        </span>
                        
                    
                    </div>
                    
                    {/* Navegación */}
                    <div className={styles.navContainer}>
                        <div className={styles.navHeader}>
                            {role === 'administrador' ? t('nav.administration') || 'Administración' : t('nav.my_account') || 'Mi Cuenta'}
                        </div>
                        <ul>
                            {role === 'administrador' ? (
                                <>
                                    <li>
                                        <Link 
                                            href="/admin/GestionarPrestamos" 
                                            className={`${styles.navLink} ${isActive('/admin/GestionarPrestamos') ? styles.active : ''}`}
                                        >
                                            <span className={styles.navIcon}><FaFileContract /></span>
                                            {t('nav.gestionar_prestamos') || 'Gestionar Préstamos'}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            href="/admin/HistorialPagos" 
                                            className={`${styles.navLink} ${isActive('/admin/HistorialPagos') ? styles.active : ''}`}
                                        >
                                            <span className={styles.navIcon}><FaHistory /></span>
                                            Historial de Pagos
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            href="/admin/AgregarDatosFinancieros" 
                                            className={`${styles.navLink} ${isActive('/admin/AgregarDatosFinancieros') ? styles.active : ''}`}
                                        >
                                            <span className={styles.navIcon}><FaRegMoneyBillAlt /></span>
                                            Datos Financieros
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            href="/admin/AgregarHistorialCrediticio" 
                                            className={`${styles.navLink} ${isActive('/admin/AgregarHistorialCrediticio') ? styles.active : ''}`}
                                        >
                                            <span className={styles.navIcon}><FaChartLine /></span>
                                            Historial Crediticio
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            href="/admin/VerPerfilUsuario" 
                                            className={`${styles.navLink} ${isActive('/admin/VerPerfilUsuario') ? styles.active : ''}`}
                                        >
                                            <span className={styles.navIcon}><FaUserEdit /></span>
                                            Perfil de Usuario
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link 
                                            href="/cliente/SolicitarPrestamo" 
                                            className={`${styles.navLink} ${isActive('/cliente/SolicitarPrestamo') ? styles.active : ''}`}
                                        >
                                            <span className={styles.navIcon}><FaHandHoldingUsd /></span>
                                            Solicitar Préstamo
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            href="/cliente/DetallePrestamo" 
                                            className={`${styles.navLink} ${isActive('/cliente/DetallePrestamo') ? styles.active : ''}`}
                                        >
                                            <span className={styles.navIcon}><FaFileInvoiceDollar /></span>
                                            Mis Préstamos
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            href="/cliente/PagarCuotas" 
                                            className={`${styles.navLink} ${isActive('/cliente/PagarCuotas') ? styles.active : ''}`}
                                        >
                                            <span className={styles.navIcon}><FaCreditCard /></span>
                                            Pagar Cuotas
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            href="/cliente/HistorialCrediticio" 
                                            className={`${styles.navLink} ${isActive('/cliente/HistorialCrediticio') ? styles.active : ''}`}
                                        >
                                            <span className={styles.navIcon}><FaChartLine /></span>
                                            Historial Crediticio
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            href="/cliente/DatosFinancieros" 
                                            className={`${styles.navLink} ${isActive('/cliente/DatosFinancieros') ? styles.active : ''}`}
                                        >
                                            <span className={styles.navIcon}><FaMoneyBillWave /></span>
                                            Datos Financieros
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            href="/cliente/EstadoPagos" 
                                            className={`${styles.navLink} ${isActive('/cliente/EstadoPagos') ? styles.active : ''}`}
                                        >
                                            <span className={styles.navIcon}><FaRegCreditCard /></span>
                                            Estado de Pagos
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Footer con botón de logout */}
                <div className={styles.footer}>
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        <FaSignOutAlt className={styles.logoutIcon} />
                        Cerrar Sesión
                    </button>
                    <div className={styles.version}>v1.0.0</div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;