import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FaUser, FaMoneyBillWave, FaCreditCard, FaArrowRight, FaCheck, FaInfoCircle } from 'react-icons/fa';
import Sidebar from "../../../components/Sidebar";
import styles from '../../styles/AgregarDatosFinancieros.module.css';

const AgregarDatosFinancieros = () => {
    const router = useRouter();
    const [role, setRole] = useState<"administrador" | "cliente" | null>(null);
    const [usuarioId, setUsuarioId] = useState<string>("");
    const [ingresosMensuales, setIngresosMensuales] = useState<number>(0);
    const [numeroCuenta, setNumeroCuenta] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Referencias para animaciones interactivas
    const formCardRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!localStorage.getItem('token')) {
                router.push('/login');
            } else {
                const storedRole = localStorage.getItem("role") as "administrador" | "cliente";
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            if (role !== "administrador") {
                throw new Error("Solo los administradores pueden agregar datos financieros.");
            }

            const res = await fetch("http://localhost:3000/api/usuarios/financiero", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ usuarioId, ingresosMensuales, numeroCuenta }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al agregar los datos financieros.");
            }

            setSuccessMessage("¡Datos financieros agregados con éxito!");
            setUsuarioId("");
            setIngresosMensuales(0);
            setNumeroCuenta("");
            setLoading(false);
        } catch (error: any) {
            setError(error.message);
            setLoading(false);
        }
    };

    // Si no se ha cargado el rol, mostrar mensaje de carga mejorado
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
                <div ref={formCardRef} className={styles.container}>
                    <h1 className={styles.title}>Agregar Datos Financieros</h1>
                    
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
                            <label className={styles.label} htmlFor="ingresosMensuales">
                                Ingresos Mensuales
                                <FaMoneyBillWave className={styles.labelIcon} />
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="number"
                                    id="ingresosMensuales"
                                    value={ingresosMensuales}
                                    onChange={(e) => setIngresosMensuales(Number(e.target.value))}
                                    className={styles.input}
                                    placeholder="Ingrese los ingresos mensuales"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="numeroCuenta">
                                Número de Cuenta
                                <FaCreditCard className={styles.labelIcon} />
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="text"
                                    id="numeroCuenta"
                                    value={numeroCuenta}
                                    onChange={(e) => setNumeroCuenta(e.target.value)}
                                    className={styles.input}
                                    placeholder="Ingrese el número de cuenta"
                                    required
                                />
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
                                    <span>Agregar Datos Financieros</span>
                                    <FaArrowRight />
                                </>
                            )}
                        </button>
                        
                        <p className={styles.infoText}>
                            <FaInfoCircle style={{ marginRight: '5px', fontSize: '12px' }} />
                            Los datos financieros son necesarios para evaluar la capacidad crediticia del usuario.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgregarDatosFinancieros;