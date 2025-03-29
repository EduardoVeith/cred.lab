import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import firebaseApp from '../services/firebase';
import AuthGuard  from '../components/Auth/AuthGuard';
import EventData from '../components/types/interfaceEventData';
import styles from '../styles/eventRegister.module.scss';

const CreateEvent = () => {
  const [formData, setFormData] = useState<EventData>({
    title: '',
    category: '',
    startDate: '',
    time: '',
    endDate: '',
    description: '',
    locationName: '',
    street: '',
    number: '',
    cep: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if (!user) {
      setError('Usuário não autenticado.');
      setLoading(false);
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/dashboard/createEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao criar evento');

      router.push('/events');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.page}>
    <div className={styles.barra_tanc}>TANC</div>
    <div className={styles.container}>
      <h2 className={styles['container-title']}>Criar Evento</h2>

      {error && <p className={styles['error-message']}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles['container-inputs']}>
        <div className={styles['input-group']}>
          <label>Título</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
      
        <div className={styles['input-group']}>
          <label>Categoria</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        <div className={styles['input-group']}>
          <label>Descrição</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className={styles['input-group']}>
          <label>Nome do Local</label>
          <input
            type="text"
            name="locationName"
            value={formData.locationName}
            onChange={handleChange}
          />
        </div>

        <div className={styles['input-group']}>
          <label>Rua</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
          />
        </div>

        <div className={styles['input-group']}>
          <label>Número</label>
          <input
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
          />
        </div>

        <div className={styles['input-group']}>
          <label>CEP</label>
          <input
            type="text"
            name="cep"
            value={formData.cep}
            onChange={handleChange}
          />
        </div>  

        <div className={styles['input-group']}>
          <label>Bairro</label>
          <input
            type="text"
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleChange}
          />
        </div>  

        <div className={styles['input-group']}>
          <label>Cidade</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <div className={styles['input-group']}>
          <label>Estado</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
        </div>

        <div className={styles['input-group']}>
          <label>Data de Início</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>

        <div className={styles['input-group']}>
          <label>Data de Fim</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className={styles['button-login']}
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Criar Evento'}
        </button>
      </form>
    </div>
  </div>
  );
};

export default function ProtectedCreateEvent(){
  return (
    <AuthGuard>
      <CreateEvent />
    </AuthGuard>
  );
}