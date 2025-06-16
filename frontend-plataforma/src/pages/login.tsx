import { useState } from "react";
import { useRouter } from "next/router";
import styles from '../styles/Login.module.css';

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verificar que los campos no estén vacíos
    if (!email || !password) {
      setError("Los campos de correo y contraseña son obligatorios.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al autenticar al usuario.");
      }

      // Guardar el token, nombre y rol en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.nombre);
      localStorage.setItem("role", data.user.rol); // Almacenar el rol del usuario
      localStorage.setItem("id_usuario", data.user.id);
      // Redirigir a una página protegida, por ejemplo: dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Redirigir a la página de registro
  const handleRedirectToRegister = () => {
    router.push("/registro");
  };

  return (
      <div className={styles['login-page']}>
        <div className={styles.container}>
          <h1>Iniciar sesión</h1>
          {error && <p className={styles['error-message']}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
                className={styles['input-field']}
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                className={styles['input-field']}
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button className={styles['submit-button']} type="submit">Ingresar</button>
          </form>

          <p className={styles.footer}>¿No tienes cuenta? <button className={styles['registerButton']} onClick={handleRedirectToRegister}>Regístrate aquí</button></p>
        </div>
      </div>
  );
}