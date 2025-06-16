import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  FaMoneyCheckAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaInfoCircle
} from 'react-icons/fa';
import Sidebar from '../../../components/Sidebar';
import styles from '../../styles/EstadoPagos.module.css';

interface Prestamo {
    id: string;
    monto: number;
    tasa: number;
    plazo: number;
    cuota_mensual: number;
    estado: string;
    fecha_inicio: string;
}

interface Amortization {
    id: string;
    numero_cuota: number;
    monto_cuota: number;
    saldo_restante: number;
    estado: string;
}

export default function EstadoPagos() {
    const router = useRouter();
    const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
    const [selectedPrestamoId, setSelectedPrestamoId] = useState<string | null>(null);
    const [amortization, setAmortization] = useState<Amortization[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<'administrador' | 'cliente' | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Usamos el operador de fusión nula para asignar un valor predeterminado si el token es null o undefined
            const token = localStorage.getItem('token') ?? null;

            // Usamos el operador de fusión nula para asignar un valor predeterminado si el role es null o undefined
            const role = localStorage.getItem('role') as 'administrador' | 'cliente' ?? 'cliente';

            if (!token) {
                router.push('/login');
                return;
            }

            setRole(role);
            setLoading(true);

            const fetchPrestamos = async () => {
                try {
                    const res = await fetch('http://localhost:3002/api/prestamos', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (!res.ok) {
                        throw new Error('');
                    }

                    const data = await res.json();
                    setPrestamos(data);
                } catch (error: any) {
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchPrestamos();
        }
    }, [router]);

    const handlePrestamoChange = async (prestamoId: string) => {
        setSelectedPrestamoId(prestamoId);
        setError(null);

        try {
            // Usamos el operador de fusión nula para asignar un valor predeterminado si el token es null o undefined
            const token = localStorage.getItem('token') ?? null;

            const res = await fetch(`http://localhost:3002/api/prestamos/amortizacion/${prestamoId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Error al obtener la amortización');
            }

            const data = await res.json();

            // Ordenar las cuotas por número de cuota antes de guardarlas en el estado
            const sortedAmortization = data.sort((a: Amortization, b: Amortization) =>
                a.numero_cuota - b.numero_cuota
            );
            setAmortization(sortedAmortization);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getStatusIcon = (estado: string) => {
        switch(estado) {
            case 'Pagado':
                return <FaCheckCircle className={`${styles.statusIcon} ${styles.statusPaid}`} />;
            case 'Pendiente':
                return <FaHourglassHalf className={`${styles.statusIcon} ${styles.statusPending}`} />;
            case 'Vencido':
                return <FaTimesCircle className={`${styles.statusIcon} ${styles.statusOverdue}`} />;
            default:
                return <FaInfoCircle className={`${styles.statusIcon}`} />;
        }
    };

    if (loading) {
        return (
            <div className={styles.estadoPagosContainer}>
                {role && <Sidebar role={role} />}
                <div className={styles.contentContainer}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Cargando información de pagos...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.estadoPagosContainer}>
            {role && <Sidebar role={role} />}
            <div className={styles.contentContainer}>
                <div className={styles.headerSection}>
                    <h1 className={styles.title}>
                        <FaMoneyCheckAlt className={styles.titleIcon} />
                        Estado de Pagos
                    </h1>
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        <FaExclamationTriangle />
                        <span>{error}</span>
                    </div>
                )}

                <div className={styles.prestamoSelectorContainer}>
                    <label className={styles.selectorLabel} htmlFor="prestamo">Selecciona un préstamo:</label>
                    <select
                        id="prestamo"
                        className={styles.prestamoSelector}
                        onChange={(e) => handlePrestamoChange(e.target.value)}
                        value={selectedPrestamoId ?? ''}
                    >
                        <option value="">-- Selecciona un préstamo --</option>
                        {prestamos.map((prestamo) => (
                            <option key={prestamo.id} value={prestamo.id}>
                                Préstamo #{prestamo.id} - {formatCurrency(prestamo.monto)}
                                {prestamo.estado === 'Pendiente de aprobación' ? ' (Pendiente)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedPrestamoId && (
                    <div className={styles.amortizacionContainer}>
                        <h2 className={styles.sectionTitle}>Amortización</h2>
                        {amortization.length > 0 ? (
                            <div className={styles.tableWrapper}>
                                <table className={styles.amortizacionTable}>
                                    <thead>
                                        <tr>
                                            <th>Número de Cuota</th>
                                            <th>Monto de Cuota</th>
                                            <th>Saldo Restante</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {amortization.map((cuota) => (
                                            <tr key={cuota.id}>
                                                <td>{cuota.numero_cuota}</td>
                                                <td>{formatCurrency(cuota.monto_cuota)}</td>
                                                <td>{formatCurrency(cuota.saldo_restante)}</td>
                                                <td className={styles.statusCell}>
                                                    {getStatusIcon(cuota.estado)}
                                                    <span>{cuota.estado}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={styles.noDataMessage}>
                                <FaInfoCircle />
                                <p>No hay datos de amortización disponibles.</p>
                            </div>
                        )}
                    </div>
                )}

                {!selectedPrestamoId && prestamos.length > 0 && (
                    <div className={styles.selectionPrompt}>
                        <FaInfoCircle className={styles.promptIcon} />
                        <p>Por favor, seleccione un préstamo para ver los detalles de amortización.</p>
                    </div>
                )}

                {prestamos.length === 0 && !loading && (
                    <div className={styles.noPrestamosMessage}>
                        <FaInfoCircle className={styles.infoIcon} />
                        <div>
                            <h3>No hay préstamos registrados</h3>
                            <p>Actualmente no tiene préstamos activos en nuestro sistema.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}