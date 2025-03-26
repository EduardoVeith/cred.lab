import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/login.module.scss';
import { FiUser, FiLock } from 'react-icons/fi';

export default function Cadastro() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        cpf: '',
        birthDate: '',
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Erro ao cadastrar');

            alert('Cadastro realizado com sucesso!');
            router.push('/login');
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
                <form onSubmit={handleSubmit} className={styles.container}>
                    <h2 className={styles['container-title']}>Cadastro</h2>

                    <div className={styles['container-inputs']}>
                        {[
                            { name: 'name', placeholder: 'Nome completo' },
                            { name: 'email', placeholder: 'E-mail', type: 'email' },
                            { name: 'password', placeholder: 'Senha', type: 'password' },
                            { name: 'phone', placeholder: 'Telefone' },
                            { name: 'cpf', placeholder: 'CPF' },
                            { name: 'birthDate', type: 'date' },
                        ].map((input) => (
                            <div key={input.name} className={styles['input-group']}>
                                <input
                                    name={input.name}
                                    type={input.type || 'text'}
                                    placeholder={input.placeholder}
                                    value={(form as any)[input.name]}
                                    onChange={handleChange}
                                    required
                                />
                                <FiUser />
                            </div>
                        ))}
                    </div>

                    {errorMsg && <p className={styles['error-message']}>{errorMsg}</p>}

                    <button
                        type="submit"
                        className={styles['button-login']}
                        disabled={loading}
                    >
                        <span className={styles['button-login-text']}>
                            {loading ? <span className={styles.spinner}></span> : 'Cadastrar'}
                        </span>
                    </button>

                    <div className={styles.divider}></div>

                    <p className={styles['text-center']}>
                        Já tem uma conta? <a href="/login">Fazer login</a>
                    </p>
                </form>
            </div>
        </div>
    );
}
