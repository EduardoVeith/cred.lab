import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import firebaseApp from '../services/firebase';
import AuthGuard  from '../components/Auth/AuthGuard';
import EventData from '../components/types/interfaceEventData';


const CreateEvent = () => {
  const [formData, setFormData] = useState<EventData>({
    title: '',
    category: '',
    startDate: '',
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

};

export default CreateEvent;
