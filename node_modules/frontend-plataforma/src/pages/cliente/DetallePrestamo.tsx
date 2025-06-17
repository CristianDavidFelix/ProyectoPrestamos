import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../../components/Sidebar';
import styles from '../../styles/DetallePrestamo.module.css'; // Importar el archivo CSS

// Definir una interfaz para los datos del préstamo
interface Prestamo {
  id: string;
  fecha_inicio: string;
  monto: number;
  estado: string;
}

export default function DetallePrestamos() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [role, setRole] = useState<'administrador' | 'cliente' | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role') as 'administrador' | 'cliente';

      if (!token) {
        router.push('/login');
        return;
      }

      setRole(role);

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
        }
      };

      fetchPrestamos();
    }
  }, [router]);

  // Redirigir directamente al componente DetallePrestamoTotal.tsx
  const verDetalles = (prestamoId: string) => {
    router.push(`DetallePrestamoTotal?prestamoId=${prestamoId}`);
  };

  return (
    <div className={styles.detallePrestamoContainer}>
      {role && <Sidebar role={role} />}
      <div className={styles.contentContainer}>
        <h1>Detalles de Préstamos</h1>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {prestamos.length === 0 ? (
          <p className={styles.noDataMessage}>No tienes préstamos registrados.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Fecha</th>
                <th className={styles.th}>Monto</th>
                <th className={styles.th}>Estado</th>
                <th className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prestamos.map((prestamo) => (
                <tr key={prestamo.id} className={styles.tr}>
                  <td className={styles.td}>{new Date(prestamo.fecha_inicio).toLocaleDateString()}</td>
                  <td className={styles.td}>${prestamo.monto.toLocaleString()}</td>
                  <td className={styles.td}>{prestamo.estado.replace(/_/g, ' ')}</td>
                  <td className={styles.td}>
                    <button
                      className={styles.detalleButton}
                      onClick={() => verDetalles(prestamo.id)}
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
