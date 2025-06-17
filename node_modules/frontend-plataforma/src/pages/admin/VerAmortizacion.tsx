import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "../../../components/Sidebar";
import styles from '../../styles/VerAmortizacion.module.css';

interface Prestamo {
    id: string;
    monto: number;
    tasa: number;
    plazo: number;
    cuota_mensual: number;
    estado: string;
    fecha_inicio: string;
}

interface Amortizacion {
    id: string;
    numero_cuota: number;
    monto_cuota: number;
    saldo_restante: number;
    estado: string;
}

const VerAmortizacion = () => {
    const router = useRouter();
    const [clienteId, setClienteId] = useState("");
    const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
    const [selectedPrestamoId, setSelectedPrestamoId] = useState<string>("");
    const [amortizacion, setAmortizacion] = useState<Amortizacion[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<"administrador" | "cliente" | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");

        if (!token || userRole !== "administrador") {
            router.push("/login");
            return;
        }

        setRole(userRole as "administrador" | "cliente");
    }, [router]);

    const handleBuscarPrestamos = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setPrestamos([]);
        setSelectedPrestamoId("");
        setAmortizacion([]);

        if (!clienteId.trim()) {
            setError("Por favor ingrese un ID de cliente válido");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3002/api/prestamos`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                mode: 'cors'  // Agregar modo explícito
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("La respuesta no es JSON válido");
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Error al obtener préstamos");
            }

            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                // Filtrar préstamos por el ID del cliente
                const prestamosFiltrados = data.filter(prestamo => prestamo.usuario_id === clienteId);
                if (prestamosFiltrados.length > 0) {
                    setPrestamos(prestamosFiltrados);
                } else {
                    throw new Error("No hay préstamos registrados para este cliente");
                }
            } else {
                throw new Error("No hay préstamos registrados");
            }
        } catch (error) {
            console.error("Error al buscar préstamos:", error); // Agregar log
            setError(error instanceof Error ? error.message : "Error al buscar préstamos");
        }
    };

    const handlePrestamoChange = async (prestamoId: string) => {
        setSelectedPrestamoId(prestamoId);
        setAmortizacion([]);
        setError(null);

        if (!prestamoId) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3002/api/prestamos/amortizacion/${prestamoId}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                mode: 'cors'  // Agregar modo explícito
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("La respuesta no es JSON válido");
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Error al obtener amortización");
            }

            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setAmortizacion(data.sort((a, b) => a.numero_cuota - b.numero_cuota));
            } else {
                throw new Error("No hay tabla de amortización disponible");
            }
        } catch (error) {
            console.error("Error al obtener amortización:", error); // Agregar log
            setError(error instanceof Error ? error.message : "Error al obtener amortización");
        }
    };

    if (!role) {
        return null;
    }

    return (
        <div style={{ display: "flex" }}>
            <Sidebar role={role} />
            <div className={styles.container}>
                <h1 className={styles.title}>Ver Amortización de Préstamos</h1>

                <form onSubmit={handleBuscarPrestamos} className={styles.formGroup}>
                    <div>
                        <label htmlFor="clienteId" className={styles.label}>ID del Cliente:</label>
                        <input
                            id="clienteId"
                            type="text"
                            value={clienteId}
                            onChange={(e) => setClienteId(e.target.value)}
                            className={styles.input}
                            placeholder="Ingrese el ID del cliente"
                            required
                        />
                        <button type="submit" className={styles.submitButton}>
                            Buscar Préstamos
                        </button>
                    </div>
                </form>

                {error && <p className={styles.errorMessage}>{error}</p>}

                {prestamos.length > 0 && (
                    <div className={styles.formGroup}>
                        <label htmlFor="prestamo" className={styles.label}>Seleccione Préstamo:</label>
                        <select
                            id="prestamo"
                            value={selectedPrestamoId}
                            onChange={(e) => handlePrestamoChange(e.target.value)}
                            className={styles.select}
                        >
                            <option value="">Seleccione un préstamo</option>
                            {prestamos.map((prestamo) => (
                                <option key={prestamo.id} value={prestamo.id}>
                                    Préstamo #{prestamo.id} - ${prestamo.monto.toLocaleString()} ({prestamo.estado})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {amortizacion.length > 0 && (
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Cuota</th>
                            <th>Monto</th>
                            <th>Saldo</th>
                            <th>Estado</th>
                        </tr>
                        </thead>
                        <tbody>
                        {amortizacion.map((cuota) => (
                            <tr key={cuota.id}>
                                <td>{cuota.numero_cuota}</td>
                                <td>${cuota.monto_cuota.toLocaleString()}</td>
                                <td>${cuota.saldo_restante.toLocaleString()}</td>
                                <td>{cuota.estado}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default VerAmortizacion;