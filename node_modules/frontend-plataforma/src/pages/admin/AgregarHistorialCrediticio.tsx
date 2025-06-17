import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FaUser, FaFileAlt, FaChartLine, FaCheckCircle, FaInfoCircle, FaSave } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import styles from '../../styles/AgregarHistorialCrediticio.module.css';

const AgregarHistorialCrediticio = () => {
    const router = useRouter();
    const [role, setRole] = useState<"administrador" | "cliente" | null>(null);
    const [usuarioId, setUsuarioId] = useState<string>("");
    const [descripcion, setDescripcion] = useState<string>("");
    const [puntaje, setPuntaje] = useState<number>(500); // Valor predeterminado más razonable
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
    // Referencia para animación de la tarjeta
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!localStorage.getItem('token')) {
                router.push('/login');
            } else {
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
        setSuccessMessage(null);
        setLoading(true);

        try {
            if (role !== "administrador") {
                throw new Error("Solo los administradores pueden agregar historial crediticio.");
            }

            const res = await fetch("http://localhost:3001/api/usuarios/crediticio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ usuarioId, descripcion, puntaje }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Error al agregar el historial crediticio.");
            }

            setSuccessMessage("Historial crediticio agregado con éxito.");
            setUsuarioId("");
            setDescripcion("");
            setPuntaje(500);
            setLoading(false);
        } catch (error: any) {
            setError(error.message);
            setLoading(false);
        }
    };

    // Función para obtener el color del puntaje según el valor
    const getScoreColor = (score: number) => {
        if (score < 300) return '#dc2626'; // Rojo
        if (score < 500) return '#f59e0b'; // Amarillo
        if (score < 700) return '#10b981'; // Verde
        return '#3b82f6'; // Azul
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
                        <FaChartLine style={{ marginRight: '10px' }} />
                        Agregar Historial Crediticio
                    </h1>
                    
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}
                    
                    {successMessage && (
                        <div className={styles.successMessage}>
                            <FaCheckCircle className={styles.successIcon} />
                            {successMessage}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="usuarioId">
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
                                    placeholder="Ingrese el ID del usuario"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="descripcion">
                                Descripción
                                <FaFileAlt className={styles.labelIcon} />
                            </label>
                            <div className={styles.inputWrapper}>
                                <textarea
                                    id="descripcion"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    className={styles.textarea}
                                    placeholder="Describa la actividad crediticia del usuario"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="puntaje">
                                Puntaje Crediticio: {puntaje}
                                <FaChartLine className={styles.labelIcon} />
                            </label>
                            <div className={styles.scoreInput}>
                                <input
                                    type="range"
                                    id="puntaje"
                                    min="0"
                                    max="850"
                                    value={puntaje}
                                    onChange={(e) => setPuntaje(Number(e.target.value))}
                                    className={styles.scoreSlider}
                                    required
                                />
                                <div 
                                    className={styles.scoreValue} 
                                    style={{ 
                                        left: `${(puntaje / 850) * 100}%`,
                                        background: getScoreColor(puntaje)
                                    }}
                                >
                                    {puntaje}
                                </div>
                                <div className={styles.scoreTags}>
                                    <span className={styles.scoreTag}>Bajo</span>
                                    <span className={styles.scoreTag}>Medio</span>
                                    <span className={styles.scoreTag}>Bueno</span>
                                    <span className={styles.scoreTag}>Excelente</span>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.loadingSpinner}></span>
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    <span>Agregar Historial Crediticio</span>
                                </>
                            )}
                        </button>
                        
                        <p className={styles.infoText}>
                            <FaInfoCircle style={{ marginRight: '5px' }} />
                            El puntaje crediticio ayuda a determinar la capacidad crediticia del usuario.
                            Un puntaje más alto indica mejor historial crediticio.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgregarHistorialCrediticio;