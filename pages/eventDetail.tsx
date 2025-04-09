// pages/eventDetail.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import firebaseApp from '../services/firebase';
import AuthGuard from '../components/Auth/AuthGuard';
import styles from '../styles/EventDetail.module.scss'; // Crie ou ajuste conforme sua estrutura de estilos

// Define a interface do detalhamento do evento, baseada nos dados que você já utiliza
interface EventDetail {
    id: string;
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
    // Acrescente outros campos que eventualmente você utilize
}

const EventDetailPage = () => {
    const router = useRouter();
    // Caso você opte por rota dinâmica, utilize router.query.id
    // Aqui estamos esperando um parâmetro id na query, ex: /eventDetail?id=123
    const { id } = router.query;

    const [eventData, setEventData] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return; // Aguarda o id chegar
        const fetchEventDetail = async () => {
            const auth = getAuth(firebaseApp);
            const user = auth.currentUser;
            if (!user) {
                setError('Usuário não autenticado.');
                setLoading(false);
                return;
            }
            try {
                const token = await user.getIdToken();
                const response = await fetch(`/api/dashboard/eventDetail?id=${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(errorMessage);
                }
                const data = await response.json();
                setEventData(data);
            } catch (err: any) {
                setError(err.message || 'Erro ao buscar detalhes do evento');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetail();
    }, [id]);

    if (loading) return <div>Carregando...</div>;
    if (error) return <div>Erro: {error}</div>;
    if (!eventData) return <div>Nenhum evento encontrado.</div>;

    return (
        <div className={styles.eventDetailContainer}>
            <header className={styles.header}>
                <h1>{eventData.title}</h1>
            </header>
            <section className={styles.details}>
                <p><strong>Descrição:</strong> {eventData.description}</p>
                <p><strong>Categoria:</strong> {eventData.category}</p>
                <p><strong>Início:</strong> {eventData.startDate}</p>
                <p><strong>Término:</strong> {eventData.endDate}</p>
                {eventData.imageUrl && (
                    <div className={styles.imageContainer}>
                        <img src={eventData.imageUrl} alt={eventData.title} />
                    </div>
                )}
            </section>
        </div>
    );
};

export default function ProtectedEventDetail() {
    return (
        <AuthGuard>
            <EventDetailPage />
        </AuthGuard>
    );
}
