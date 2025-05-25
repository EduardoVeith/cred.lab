// pages/events.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseApp from '../services/firebase';
import AuthGuard from '../components/Auth/AuthGuard';
import CardEvento from '../components/Layout/CardEvento';
import { FiFilter, FiPlus, FiGrid } from 'react-icons/fi';
import styles from '../styles/events.module.scss';

interface Evento {
    id: string;
    title: string;
    address?: { locationName: string };
    startDate: string;
}

interface ApiResponse {
    createdEvents: Evento[];
    participatingEvents: Evento[];
}

function EventsPage() {
    const [createdEvents, setCreatedEvents] = useState<Evento[]>([]);
    const [participatingEvents, setParticipatingEvents] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return; // espera usuário autenticado

            setLoading(true);
            setError(null);

            try {
                const token = await user.getIdToken();
                const res = await fetch('/api/dashboard/events', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    let msg = 'Erro ao buscar eventos.';
                    try { msg = (await res.json()).error; } catch { }
                    throw new Error(msg);
                }

                const data: ApiResponse = await res.json();
                setCreatedEvents(data.createdEvents || []);
                setParticipatingEvents(data.participatingEvents || []);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <div className={styles.loading}>Carregando eventos...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <AuthGuard>
            <div className={styles.dashboardContainer}>
                <div className={styles.barraTanc}>TANC</div>
                <div style={{ marginTop: '80px' }}>
                    <div className={styles.topBar}>
                        <div>
                        <FiFilter className={styles.filterIcon} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                        className={`${styles.actionButton} ${styles.primaryAction}`}
                        onClick={() => (window.location.href = '/eventRegister')}
                        >
                        <FiPlus />
                        Promover Evento
                        </button>
                        <button
                        className={`${styles.actionButton} ${styles.primaryAction}`}
                        onClick={() => (window.location.href = '/eventList')}
                        >
                        <FiGrid />
                        Todos os Eventos
                        </button>
                    </div>
                    </div>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Meus Eventos</h2>
                        <div className={styles.eventsGrid}>
                            {createdEvents.length > 0 ? (
                                createdEvents.map(evt => (
                                    <Link
                                        key={evt.id}
                                        href={`/eventDetail?id=${evt.id}`}
                                        className={styles.cardWrapper}
                                    >
                                        <CardEvento
                                            nome={evt.title}
                                            endereco={evt.address?.locationName || 'indisponível'}
                                            dataHora={evt.startDate}
                                        />
                                    </Link>
                                ))
                            ) : (
                                <p>Você não criou nenhum evento.</p>
                            )}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Meus Ingressos</h2>
                        <div className={styles.eventsGrid}>
                            {participatingEvents.length > 0 ? (
                                participatingEvents.map(evt => (
                                    <Link
                                        key={evt.id}
                                        href={`/eventDetail?id=${evt.id}`}
                                        className={styles.cardWrapper}
                                    >
                                        <CardEvento
                                            nome={evt.title}
                                            endereco={evt.address?.locationName || 'indisponível'}
                                            dataHora={evt.startDate}
                                        />
                                    </Link>
                                ))
                            ) : (
                                <p>Você não está participando de nenhum evento.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AuthGuard>
    );
}

export default EventsPage;
