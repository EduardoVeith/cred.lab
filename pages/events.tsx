// pages/events.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseApp from '../services/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  DocumentData,
} from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import AuthGuard from '../components/Auth/AuthGuard';
import CardEvento from '../components/Layout/CardEvento';
import { FiFilter, FiPlus, FiGrid } from 'react-icons/fi';
import styles from '../styles/events.module.scss';

interface Evento {
    id: string;
    ticketId?: string;
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
            setCreatedEvents([]);
            setParticipatingEvents([]);
            setLoading(false);
            return;
        }

        try {
            const idToken = await user.getIdToken();
            const res = await fetch('/api/dashboard/events', {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
            });
            if (!res.ok) throw new Error('Erro ao buscar eventos criados');
            const data = await res.json();
            setCreatedEvents(data.createdEvents);

            const snap = await getDocs(
                query(collection(db, 'tickets'), where('userId', '==', user.uid))
            );

            const rawTickets = snap.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    eventId: data.eventId,
                    qrSvg: data.qrSvg,
                };
            });

            const enrichedEvents = await Promise.all(
                rawTickets.map(async (ticket) => {
                    const eventSnap = await getDoc(doc(db, 'events', ticket.eventId));
                    const eventData = eventSnap.exists() ? eventSnap.data() : {};

                    return {
                        id: ticket.eventId,
                        ticketId: ticket.id,
                        title: eventData.title || 'Evento sem título',
                        address: {
                            locationName: eventData.address?.street || 'Endereço não disponível',
                        },
                        startDate: eventData.startDate || 'Data não disponível',
                    };
                })
            );

            setParticipatingEvents(enrichedEvents);
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar eventos.');
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
                                    key={evt.ticketId}
                                    href={`/tickets/${evt.ticketId}`}
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
