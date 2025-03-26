import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/login.module.scss';
import { FiUser, FiLock } from 'react-icons/fi';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // limpando espaços em branco
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail.includes('@')) {
      setErrorMsg('Digite um e-mail válido.');
      setLoading(false);
      return;
    }

    if (cleanPassword === '') {
      setErrorMsg('Digite a senha.');
      setLoading(false);
      return;
    }
    

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao fazer login');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Erro inesperado no login:', err);
      setErrorMsg('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.barra_tanc}>TANC</div>
      <div className={styles.page}>
        <form onSubmit={handleLogin} className={styles.container}>
          <h2 className={styles['container-title']}>Login</h2>

          <div className={styles['container-inputs']}>
            <div className={styles['input-group']}>
              <input
                type="email"
                placeholder="Endereço de E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FiUser />
            </div>

            <div className={styles['input-group']}>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FiLock />
            </div>
          </div>

          {errorMsg && <p className={styles['error-message']}>{errorMsg}</p>}

          <button
            type="submit"
            className={styles['button-login']}
            disabled={loading}
          >
            <span className={styles['button-login-text']}>
              {loading ? <span className={styles.spinner}></span> : 'Entrar'}
            </span>
          </button>

          <div className={styles.divider}></div>

          <p className={styles['text-center']}>
            Ainda não tem uma conta? <Link href="/register">Cadastre-se</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
