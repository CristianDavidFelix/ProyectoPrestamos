import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FaCheck, FaTimes, FaMoneyBillWave, FaCalendarAlt, FaSearch, FaExclamationTriangle, FaFileInvoiceDollar, FaIdCard } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import styles from '../../styles/GestionarPrestamos.module.css';

const GestionarPrestamos = () => {
    const router = useRouter();
    const [role, setRole] = useState<"administrador" | "cliente" | null>(null);
    const [prestamosPendientes, setPrestamosPendientes] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    
    // Referencia para animación de la tarjeta
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Verificar si no hay token en localStorage
            if (!localStorage.getItem('token')) {
                // Redirigir al login si no existe el token
                router.push('/login');
            } else {
                // Recuperar el rol del usuario
                const storedRole = localStorage.getItem("role") as "administrador" | "cliente";
                setRole(storedRole);
            }
        }
    }, [router]);

    useEffect(() => {
        // Solo intentar cargar préstamos si el rol es de administrador
        if (role === "administrador") {
            const fetchPrestamosPendientes = async () => {
                try {
                    setLoading(true);
                    const res = await fetch("http://localhost:3002/api/prestamos/", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    });

                    if (!res.ok) {
                        throw new Error("Error al cargar los préstamos");
                    }

                    const data = await res.json();
                    setPrestamosPendientes(data.filter((p: any) => p.estado === "pendiente_aprobacion"));
                    setLoading(false);
                } catch (error: any) {
                    setError(error.message);
                    setLoading(false);
                }
            };

            fetchPrestamosPendientes();
        } else if (role === "cliente") {
            // Redirigir a dashboard si no es administrador
            router.push("/dashboard");
        }
    }, [role, router]);

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

    const handleAprobar = async (prestamoId: string) => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:3002/api/prestamos/aprobar", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ prestamoId }),
            });

            if (!res.ok) {
                throw new Error("Error al aprobar el préstamo");
            }

            setSuccessMessage("Préstamo aprobado con éxito.");
            setPrestamosPendientes((prev) => prev.filter((p) => p.id !== prestamoId));
            setLoading(false);
        } catch (error: any) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleRechazar = async (prestamoId: string) => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:3002/api/prestamos/rechazar", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ prestamoId }),
            });

            if (!res.ok) {
                throw new Error("Error al rechazar el préstamo");
            }

            setSuccessMessage("Préstamo rechazado con éxito.");
            setPrestamosPendientes((prev) => prev.filter((p) => p.id !== prestamoId));
            setLoading(false);
        } catch (error: any) {
            setError(error.message);
            setLoading(false);
        }
    };

    // Si no se ha cargado el rol, mostrar mensaje de carga
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
                        Gestionar Préstamos
                    </h1>
                    
                    {error && (
                        <div className={styles.errorMessage}>
                            <FaExclamationTriangle style={{ marginRight: '8px' }} />
                            {error}
                        </div>
                    )}
                    
                    {successMessage && (
                        <div className={styles.successMessage}>
                            <FaCheck className={styles.successIcon} />
                            {successMessage}
                        </div>
                    )}

                    <div className={styles.tableContainer}>
                        {loading ? (
                            <div>
                                <div className={styles.shimmerRow}></div>
                                <div className={styles.shimmerRow}></div>
                                <div className={styles.shimmerRow}></div>
                            </div>
                        ) : prestamosPendientes.length > 0 ? (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>ID Usuario</th> {/* Cambiado de "Usuario" a "ID Usuario" */}
                                        <th>Monto</th>
                                        <th>Plazo</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prestamosPendientes.map((prestamo) => (
                                        <tr key={prestamo.id}>
                                            <td>{prestamo.id}</td>
                                            <td>
                                                <div className={styles.userIdColumn}>
                                                    <FaIdCard style={{ marginRight: '5px', color: '#718096' }} />
                                                    {prestamo.usuario_id || prestamo.usuarioId}
                                                </div>
                                            </td>
                                            <td className={styles.montoColumn}>
                                                <FaMoneyBillWave style={{ marginRight: '5px', color: '#0066cc' }} />
                                                ${prestamo.monto.toLocaleString('es-MX')}
                                            </td>
                                            <td>
                                                <div className={styles.plazoColumn}>
                                                    <FaCalendarAlt style={{ color: '#718096' }} />
                                                    <span className={styles.plazoTag}>{prestamo.plazo} meses</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusTag} ${styles.statusPending}`}>
                                                    Pendiente
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actionGroup}>
                                                    <button
                                                        className={`${styles.actionButton} ${styles.approve}`}
                                                        onClick={() => handleAprobar(prestamo.id)}
                                                    >
                                                        <FaCheck />
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        className={`${styles.actionButton} ${styles.reject}`}
                                                        onClick={() => handleRechazar(prestamo.id)}
                                                    >
                                                        <FaTimes />
                                                        Rechazar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyStateIcon}>
                                    <FaSearch />
                                </div>
                                <h3>No hay préstamos pendientes</h3>
                                <p className={styles.emptyStateText}>
                                    Actualmente no hay préstamos que requieran revisión
                                </p>
                            </div>
                        )}
                    </div>

                    {prestamosPendientes.length > 0 && (
                        <div className={styles.statsContainer}>
                            <div className={styles.statsText}>
                                <FaFileInvoiceDollar />
                                Total de préstamos pendientes: {prestamosPendientes.length}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionarPrestamos;