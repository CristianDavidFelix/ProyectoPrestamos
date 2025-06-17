import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  // Redirigir automáticamente a la página de login cuando la página de inicio se carga
  useEffect(() => {
    router.push('/login');
  }, [router]);

  return null; // Puedes devolver `null` ya que no necesitas mostrar nada aquí
}
