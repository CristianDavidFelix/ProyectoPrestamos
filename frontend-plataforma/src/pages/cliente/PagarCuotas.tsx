import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaCreditCard, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaInfoCircle, 
  FaArrowRight
} from 'react-icons/fa';
import Sidebar from "../../../components/Sidebar";
import styles from '../../styles/PagarCuotas.module.css';

interface Prestamo {
    id: string;
    monto: number;
    fecha_inicio: string;
    estado: string;
    cuota_mensual: number;
}

const PagarCuotas = () => {
    const router = useRouter();
    const [role, setRole] = useState<'administrador' | 'cliente' | null>(null);
    const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
    const [selectedPrestamoId, setSelectedPrestamoId] = useState<string>("");
    const [selectedPrestamo, setSelectedPrestamo] = useState<Prestamo | null>(null);
    const [monto, setMonto] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPrestamos, setLoadingPrestamos] = useState<boolean>(true);

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

    useEffect(() => {
        if (role === 'cliente') {
            const fetchPrestamos = async () => {
                setLoadingPrestamos(true);
                try {
                    const res = await fetch("http://localhost:3002/api/prestamos", {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    });

                    if (!res.ok) {
                        throw new Error("No se pudieron cargar los préstamos");
                    }

                    const data = await res.json();
                    // Filtrar solo préstamos aprobados
                    const prestamosAprobados = data.filter((prestamo: Prestamo) =>
                        prestamo.estado === 'aprobado'
                    );
                    setPrestamos(prestamosAprobados);
                } catch (error: any) {
                    setError(error.message);
                } finally {
                    setLoadingPrestamos(false);
                }
            };

            fetchPrestamos();
        }
    }, [role]);

    // Establecer el monto por defecto como la cuota mensual al seleccionar un préstamo
    useEffect(() => {
        if (selectedPrestamoId) {
            const prestamo = prestamos.find(p => p.id === selectedPrestamoId);
            if (prestamo) {
                setSelectedPrestamo(prestamo);
                setMonto(prestamo.cuota_mensual || 0);
            }
        } else {
            setSelectedPrestamo(null);
            setMonto(0);
        }
    }, [selectedPrestamoId, prestamos]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);
    
        // Efecto visual al botón
        const btn = e.currentTarget as HTMLButtonElement;
        btn.classList.add(styles.buttonSubmitting);
    
        try {
            if (!selectedPrestamoId || monto <= 0) {
                setError("Por favor, seleccione un préstamo e ingrese un monto válido.");
                setLoading(false);
                btn.classList.remove(styles.buttonSubmitting);
                return;
            }
    
            const res = await fetch("http://localhost:3003/api/pagos/realizar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ prestamoId: selectedPrestamoId, monto }),
            });
    
            const data = await res.json();
    
            if (!res.ok) {
                throw new Error(data.error || "Error al realizar el pago.");
            }
    
            // Mostrar mensaje de éxito y el cambio si existe
            if (data.cambio) {
                setSuccessMessage(`¡Pago realizado con éxito! Cambio: $${data.cambio.toFixed(2)}`);
            } else {
                setSuccessMessage("¡Pago realizado con éxito!");
            }
    
            // Mostrar efectos de confeti
            createConfetti();
            
            // Limpiar el formulario
            setSelectedPrestamoId("");
            setMonto(0);
            
            // Recargar los préstamos para mostrar el estado actualizado
            setTimeout(() => {
                const fetchPrestamosActualizados = async () => {
                    const res = await fetch("http://localhost:3002/api/prestamos", {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const prestamosAprobados = data.filter((prestamo: Prestamo) =>
                            prestamo.estado === 'aprobado'
                        );
                        setPrestamos(prestamosAprobados);
                    }
                };
                fetchPrestamosActualizados();
            }, 2000);
        } catch (error: any) {
            setError(error.message);
        } finally {
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

    // Si no se ha cargado el rol, mostrar mensaje de carga con estilo
    if (!role) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando su información financiera...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <Sidebar role={role} />
            <div className={styles.contentContainer}>
                <div className={styles.formCard}>
                    <h1 className={styles.title}>
                        <FaCreditCard className={styles.titleIcon} />
                        Pagar Cuotas
                    </h1>
                    
                    {error && (
                        <div className={styles.errorMessage}>
                            <FaExclamationTriangle />
                            {error}
                        </div>
                    )}
                    
                    {successMessage && (
                        <div className={styles.successMessage}>
                            <FaCheckCircle className={styles.successIcon} />
                            {successMessage}
                        </div>
                    )}
                    
                    {loadingPrestamos ? (
                        <div className={styles.loadingMessage}>
                            <div className={styles.loadingSpinner}></div>
                            <p>Cargando sus préstamos...</p>
                        </div>
                    ) : prestamos.length === 0 ? (
                        <div className={styles.noDataMessage}>
                            <FaInfoCircle />
                            <p>No tiene préstamos aprobados para realizar pagos.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="prestamoId">
                                    Seleccione el Préstamo
                                    <FaMoneyBillWave className={styles.labelIcon} />
                                </label>
                                <div className={styles.inputGroup}>
                                    <select
                                        id="prestamoId"
                                        value={selectedPrestamoId}
                                        onChange={(e) => setSelectedPrestamoId(e.target.value)}
                                        className={styles.input}
                                        required
                                    >
                                        <option value="">Seleccione un préstamo</option>
                                        {prestamos.map((prestamo) => (
                                            <option key={prestamo.id} value={prestamo.id}>
                                                Préstamo #{prestamo.id} - ${prestamo.monto.toLocaleString()} -
                                                {new Date(prestamo.fecha_inicio).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {selectedPrestamo && (
                                <div className={styles.prestamoDetailCard}>
                                    <h3>Detalle del Préstamo</h3>
                                    <div className={styles.detailRow}>
                                        <div className={styles.detailItem}>
                                            <FaMoneyBillWave />
                                            <span>Monto total:</span>
                                            <strong>${selectedPrestamo.monto.toLocaleString()}</strong>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <FaCalendarAlt />
                                            <span>Fecha:</span>
                                            <strong>{new Date(selectedPrestamo.fecha_inicio).toLocaleDateString()}</strong>
                                        </div>
                                    </div>
                                    <div className={styles.suggestedPayment}>
                                        <span>Cuota mensual sugerida:</span>
                                        <strong>${selectedPrestamo.cuota_mensual?.toLocaleString() || 'No disponible'}</strong>
                                    </div>
                                </div>
                            )}
                            
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="monto">
                                    Monto a Pagar
                                    <FaCreditCard className={styles.labelIcon} />
                                </label>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="number"
                                        id="monto"
                                        value={monto}
                                        onChange={(e) => setMonto(Number(e.target.value))}
                                        className={styles.input}
                                        placeholder="Ingrese el monto a pagar"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <button type="submit" className={styles.submitButton} disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className={styles.loadingSpinner}></span>
                                        <span>Procesando pago...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Realizar Pago</span>
                                        <FaArrowRight className={styles.buttonIcon} />
                                    </>
                                )}
                            </button>
                            
                            <p className={styles.infoNote}>
                                <FaInfoCircle />
                                Los pagos se procesan inmediatamente. Por favor verifique los detalles antes de realizar el pago.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PagarCuotas;