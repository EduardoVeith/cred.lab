import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/register.module.scss';
import {
  FiUser,
  FiLock,
  FiPhone,
  FiCreditCard,
  FiCalendar,
  FiMail,
} from 'react-icons/fi';
import SuccessToast from '../components/Layout/SuccessToast';

export default function Cadastro() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    phone: '',
    birthDate: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Impede acesso se já estiver logado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'cpf') {
      maskedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    if (name === 'phone') {
      maskedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    }

    if (name === 'birthDate') {
      maskedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1');
    }

    setForm({ ...form, [name]: maskedValue });
  };

  const formatBirthDate = (maskedDate: string) => {
    const parts = maskedDate.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return maskedDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleanData = {
      ...form,
      cpf: form.cpf.replace(/\D/g, ''),
      phone: form.phone.replace(/\D/g, ''),
      birthDate: formatBirthDate(form.birthDate),
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao cadastrar');

      setShowSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.barra_tanc}>TANC</div>
      <div className={styles.page}>
        {showSuccess && (
          <SuccessToast
            message="Cadastro realizado com sucesso!"
            onClose={() => setShowSuccess(false)}
          />
        )}

        <form onSubmit={handleSubmit} className={styles.container}>
          <h2 className={styles['container-title']}>Criar uma conta</h2>

          <div className={styles['container-inputs']}>
            <div className={styles['input-group']}>
              <input
                name="name"
                placeholder="Nome completo"
                value={form.name}
                onChange={handleChange}
                required
              />
              <FiUser />
            </div>

            <div className={styles['input-group']}>
              <input
                name="email"
                type="email"
                placeholder="Endereço de email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <FiMail />
            </div>

            <div className={styles['input-group']}>
              <input
                name="password"
                type="password"
                placeholder="Senha"
                value={form.password}
                onChange={handleChange}
                required
              />
              <FiLock />
            </div>

            <div className={styles['input-group']}>
              <input
                name="cpf"
                placeholder="CPF"
                value={form.cpf}
                onChange={handleChange}
                required
              />
              <FiCreditCard />
            </div>

            <div className={styles['input-group']}>
              <input
                name="phone"
                placeholder="Celular"
                value={form.phone}
                onChange={handleChange}
                required
              />
              <FiPhone />
            </div>

            <div className={styles['input-group']}>
              <input
                name="birthDate"
                placeholder="Data de Nascimento"
                value={form.birthDate}
                onChange={handleChange}
                required
              />
              <FiCalendar />
            </div>
          </div>

          {errorMsg && <p className={styles['error-message']}>{errorMsg}</p>}

          <button type="submit" className={styles['button-login']} disabled={loading}>
            <span className={styles['button-login-text']}>
              {loading ? <span className={styles.spinner}></span> : 'Cadastrar-se'}
            </span>
          </button>

          <div className={styles.divider}></div>
          <p className={styles['text-center']}>
            Já possui uma conta? <Link href="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
