import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/login.module.scss';
import { FiUser, FiLock } from 'react-icons/fi';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import firebaseApp from '../services/firebase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/eventList'); // redireciona se já estiver logado
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

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
      const auth = getAuth(firebaseApp);
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);

      // Firebase já mantém o usuário logado automaticamente
      router.push('/eventList');
    } catch (err: any) {
      console.error('Erro no login Firebase:', err);
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('Usuário não encontrado.');
      } else if (err.code === 'auth/wrong-password') {
        setErrorMsg('Senha incorreta.');
      } else {
        setErrorMsg('Erro ao fazer login. Tente novamente.');
      }
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
