import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FaFileInvoiceDollar, FaUserAlt, FaMoneyBillWave, FaCalendarAlt, FaSearch, FaExclamationTriangle, FaChartLine } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import styles from '../../styles/HistorialPagos.module.css';

interface Payment {
    id: string;
    usuario: string;
    monto: number;
    fecha_pago: string;
}

// Updated interface to match the actual data structure from the API
interface Usuario {
    financial_data?: {
        ingresos_mensuales: string;
        numero_cuenta: string;
    };
    credit_history?: Array<{
        id: string;
        fecha: string;
        descripcion: string;
        puntaje_crediticio: number;
    }>;
}

const HistorialPagos = () => {
    const router = useRouter();
    const [role, setRole] = useState<"administrador" | "cliente" | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [usuarios, setUsuarios] = useState<Record<string, Usuario>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Referencia para animación de la tarjeta
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Verificar si no hay token en localStorage
            if (!localStorage.getItem('token')) {
                router.push('/login');
                return;
            }

            const storedRole = localStorage.getItem('role') as "administrador" | "cliente";
            setRole(storedRole);

            // Solo los administradores pueden ver esta página
            if (storedRole !== 'administrador') {
                router.push('/dashboard');
                return;
            }

            fetchPayments();
        }
    }, [router]);

    // Efecto para aplicar animación al hover en la tarjeta
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const { left, top, width, height } = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;

            // Aplicamos una sutil rotación 3D para efecto de profundidad
            containerRef.current.style.transform = `
                perspective(1000px) 
                rotateX(${y * 1}deg) 
                rotateY(${x * -1}deg) 
                translateZ(5px)
            `;
        };

        const handleMouseLeave = () => {
            if (!containerRef.current) return;
            containerRef.current.style.transform = 'none';
        };

        const card = containerRef.current;
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

    const fetchPayments = async () => {
        try {
            // Obtener historial de pagos
            const res = await fetch("http://localhost:3003/api/pagos/historial", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) {
                throw new Error("Error al cargar el historial de pagos");
            }

            const paymentsData = await res.json();
            console.log("Payments data:", paymentsData);
            setPayments(paymentsData);

            // Obtener IDs de usuarios únicos
            const userIds = [...new Set(paymentsData.map((payment: Payment) => payment.usuario))];
            console.log("User IDs to fetch:", userIds);

            // Obtener detalles de cada usuario
            const usuariosData: Record<string, Usuario> = {};
            for (const userId of userIds) {
                if (!userId) continue; // Skip if userId is null or undefined

                try {
                    console.log(`Fetching user data for ID: ${userId}`);
                    const userRes = await fetch(`http://localhost:3000/api/usuarios/perfil/${userId}`, {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    });

                    if (userRes.ok) {
                        const userData = await userRes.json();
                        console.log(`User data for ID ${userId}:`, userData);
                        usuariosData[userId] = userData;
                    } else {
                        console.error(`Error response for user ${userId}:`, userRes.status, userRes.statusText);
                    }
                } catch (error) {
                    console.error(`Error al obtener datos del usuario ${userId}:`, error);
                }
            }

            console.log("Final usuarios data:", usuariosData);
            setUsuarios(usuariosData);
            setLoading(false);
        } catch (err) {
            console.error("Error al cargar historial de pagos:", err);
            setError(err instanceof Error ? err.message : "Error desconocido");
            setLoading(false);
        }
    };

    // Función para filtrar pagos por término de búsqueda
    const filteredPayments = searchTerm
        ? payments.filter(payment =>
            payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.usuario.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : payments;

    // Calcular montos totales para resumen
    const totalPagado = payments.reduce((sum, payment) => sum + payment.monto, 0);
    const usuariosUnicos = new Set(payments.map(p => p.usuario)).size;

    if (!role) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando información del administrador...</p>
                    <div className={styles.loadingDots}>
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
                <div ref={containerRef} className={styles.container}>
                    <h1 className={styles.title}>
                        <FaFileInvoiceDollar style={{ marginRight: '10px' }} />
                        Historial de Pagos
                    </h1>

                    {error && (
                        <div className={styles.errorMessage}>
                            <FaExclamationTriangle style={{ marginRight: '8px' }} />
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingSpinner}></div>
                            <p>Cargando historial de pagos...</p>
                            <div className={styles.loadingDots}>
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID Pago</th>
                                            <th>Usuario</th>
                                            <th>Monto</th>
                                            <th>Fecha de Pago</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPayments.length > 0 ? (
                                            filteredPayments.map((payment: Payment) => (
                                                <tr key={payment.id}>
                                                    <td>{payment.id}</td>
                                                    <td>
                                                        <div className={styles.userCell}>
                                                            <span className={styles.userIcon}>
                                                                <FaUserAlt />
                                                            </span>
                                                            {payment.usuario}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={styles.montoCell}>
                                                            <FaMoneyBillWave style={{ color: '#0066cc' }} />
                                                            ${payment.monto.toFixed(2)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={styles.dateCell}>
                                                            <FaCalendarAlt style={{ color: '#718096' }} />
                                                            <span className={styles.dateTag}>
                                                                {new Date(payment.fecha_pago).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className={styles.noData}>
                                                    <div className={styles.noDataIcon}>
                                                        <FaSearch />
                                                    </div>
                                                    <p>No se encontraron pagos registrados</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {payments.length > 0 && (
                                <div className={styles.summaryCard}>
                                    <h3 className={styles.summaryTitle}>
                                        <FaChartLine />
                                        Resumen de Pagos
                                    </h3>
                                    <div className={styles.summaryGrid}>
                                        <div className={styles.summaryItem}>
                                            <div className={styles.summaryLabel}>Total Pagado</div>
                                            <div className={styles.summaryValue}>${totalPagado.toFixed(2)}</div>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <div className={styles.summaryLabel}>Total de Pagos</div>
                                            <div className={styles.summaryValue}>{payments.length}</div>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <div className={styles.summaryLabel}>Usuarios Únicos</div>
                                            <div className={styles.summaryValue}>{usuariosUnicos}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistorialPagos;