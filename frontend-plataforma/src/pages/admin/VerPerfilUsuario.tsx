import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FaUser, FaSearch, FaMoneyBillWave, FaCreditCard, FaChartLine, FaCalendarAlt, FaFileAlt, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import styles from '../../styles/VerPerfilUsuario.module.css';

const VerPerfilUsuario = () => {
    const router = useRouter();
    const [role, setRole] = useState<"administrador" | "cliente" | null>(null);
    const [usuarioId, setUsuarioId] = useState<string>("");
    const [perfil, setPerfil] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
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
                
                // Redirigir si no es administrador
                if (storedRole !== "administrador") {
                    router.push('/dashboard');
                }
            }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (role !== "administrador") {
                throw new Error("Solo los administradores pueden ver perfiles de usuarios.");
            }

            const res = await fetch(`http://localhost:3001/api/usuarios/perfil/${usuarioId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) {
                throw new Error("Error al obtener el perfil del usuario.");
            }

            const data = await res.json();
            setPerfil(data);
            setLoading(false);
        } catch (error: any) {
            setError(error.message);
            setLoading(false);
        }
    };

    // Determinar color del puntaje crediticio
    const getPuntajeColor = (puntaje: number) => {
        if (puntaje < 300) return '#dc2626'; // Rojo - mal puntaje
        if (puntaje < 500) return '#f59e0b'; // Amarillo - regular
        if (puntaje < 700) return '#10b981'; // Verde - bueno
        return '#3b82f6'; // Azul - excelente
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
                        <FaUser style={{ marginRight: '10px' }} />
                        Ver Perfil de Usuario
                    </h1>
                    
                    {error && (
                        <div className={styles.errorMessage}>
                            <FaExclamationTriangle style={{ marginRight: '8px' }} />
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="usuarioId" className={styles.label}>
                                ID del Usuario
                                <FaUser className={styles.labelIcon} />
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="text"
                                    id="usuarioId"
                                    value={usuarioId}
                                    onChange={(e) => setUsuarioId(e.target.value)}
                                    className={styles.input}
                                    placeholder="Ingrese el ID del usuario a consultar"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? (
                                <>
                                    <span className={styles.loadingSpinner}></span>
                                    <span>Buscando...</span>
                                </>
                            ) : (
                                <>
                                    <FaSearch style={{ marginRight: '5px' }} />
                                    Buscar Perfil
                                </>
                            )}
                        </button>
                    </form>

                    {loading && (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingSpinner}></div>
                            <p>Cargando datos del usuario...</p>
                            <div className={styles.loadingDots}>
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}

                    {perfil && !loading && (
                        <div className={styles.profileContainer}>
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <FaMoneyBillWave />
                                    Datos Financieros
                                </h2>
                                <div className={styles.dataCard}>
                                    <div className={styles.dataRow}>
                                        <div className={styles.dataLabel}>
                                            <FaMoneyBillWave />
                                            Ingresos Mensuales
                                        </div>
                                        <div className={styles.dataValue}>
                                            {perfil.financial_data?.ingresos_mensuales ? 
                                                `$${perfil.financial_data.ingresos_mensuales}` : 
                                                "No registrado"}
                                        </div>
                                    </div>
                                    <div className={styles.dataRow}>
                                        <div className={styles.dataLabel}>
                                            <FaCreditCard />
                                            Número de Cuenta
                                        </div>
                                        <div className={styles.dataValue}>
                                            {perfil.financial_data?.numero_cuenta || "No registrado"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <FaChartLine />
                                    Historial Crediticio
                                </h2>
                                
                                {perfil.credit_history && perfil.credit_history.length > 0 ? (
                                    <ul className={styles.historialList}>
                                        {perfil.credit_history.map((historial: any) => (
                                            <li key={historial.id} className={styles.historialItem}>
                                                <div className={styles.dataRow}>
                                                    <div className={styles.dataLabel}>
                                                        <FaCalendarAlt />
                                                        Fecha
                                                    </div>
                                                    <div className={styles.dataValue}>
                                                        {new Date(historial.fecha).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className={styles.dataRow}>
                                                    <div className={styles.dataLabel}>
                                                        <FaFileAlt />
                                                        Descripción
                                                    </div>
                                                    <div className={styles.dataValue}>
                                                        {historial.descripcion}
                                                    </div>
                                                </div>
                                                <div className={styles.dataRow}>
                                                    <div className={styles.dataLabel}>
                                                        <FaChartLine />
                                                        Puntaje
                                                    </div>
                                                    <div className={styles.dataValue}>
                                                        <div className={styles.puntajeContainer}>
                                                            <div className={styles.puntajeBar}>
                                                                <div 
                                                                    className={styles.puntajeFill} 
                                                                    style={{ 
                                                                        width: `${(historial.puntaje_crediticio / 850) * 100}%`,
                                                                        background: getPuntajeColor(historial.puntaje_crediticio) 
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span className={styles.puntajeValue}>
                                                                {historial.puntaje_crediticio}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className={styles.noDataMessage}>
                                        <div className={styles.noDataIcon}>
                                            <FaInfoCircle />
                                        </div>
                                        <p>No hay historial crediticio registrado para este usuario.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerPerfilUsuario;