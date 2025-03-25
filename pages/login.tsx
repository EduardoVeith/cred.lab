import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/login.module.scss';
import { FiUser, FiLock } from 'react-icons/fi';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Redireciona se já estiver logado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Limpar espaços
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Validações básicas no front
    if (!cleanEmail.includes('@')) {
      setErrorMsg('Digite um e-mail válido.');
      setLoading(false);
      return;
    }

    if (cleanPassword.length < 8) {
      setErrorMsg('A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.');
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

      if (!res.ok) throw new Error(data.error || 'Erro ao fazer login');

      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message);
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
            Ainda não tem uma conta? <a href="/cadastro">Cadastre-se</a>
          </p>
        </form>
      </div>
    </div>
  );
}
