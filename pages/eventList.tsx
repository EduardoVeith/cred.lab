// pages/eventList.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import CardEvento from '../components/Layout/CardEvento';
import styles from '../styles/eventList.module.scss';
import { FiFilter } from 'react-icons/fi';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import firebaseApp from '../services/firebase';
import AuthGuard from '../components/Auth/AuthGuard';

interface Evento {
  id: string;
  title: string;
  locationName: string;
  startDate: string;
  endDate: string;
}

export default function EventListPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventosPorPagina = 12;

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/dashboard/listEvents', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Erro ao buscar eventos.');
        }
        const data = (await res.json()) as any[];
        const lista = data.map(evt => ({
          id: evt.id,
          title: evt.title,
          locationName: evt.address?.locationName ?? 'indisponível',
          startDate: evt.startDate,
          endDate: evt.endDate,
        }));
        setEventos(lista);
        setPaginaAtual(1);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const totalPaginas = Math.ceil(eventos.length / eventosPorPagina);
  const eventosPaginados = eventos.slice(
    (paginaAtual - 1) * eventosPorPagina,
    paginaAtual * eventosPorPagina
  );

  async function handleLogout() {
    const auth = getAuth(firebaseApp);
    await signOut(auth);
    window.location.href = '/login';
  }

  return (
    <AuthGuard>
      <div className={styles.dashboardContainer}>
        <div className={styles.barraTanc}>TANC</div>
        <div style={{ marginTop: '80px' }}>
          <div className={styles.topBar}>
            <FiFilter className={styles.filterIcon} />
            <button
              className={styles.promoteButton}
              onClick={() => (window.location.href = '/eventRegister')}
            >
              Promover Evento
            </button>
            <button
              className={styles.toggleButton}
              onClick={() => (window.location.href = '/events')}
            >
              Meus Eventos
            </button>
            <button
              className={styles.promoteButton}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>Carregando eventos...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <>
              <div className={styles.eventsGrid}>
                {eventosPaginados.map(evt => (
                  <Link
                    key={evt.id}
                    href={`/eventDetail?id=${evt.id}`}
                    className={styles.cardWrapper}
                  >
                    <CardEvento
                      nome={evt.title}
                      endereco={evt.locationName}
                      dataHora={evt.startDate}
                    />
                  </Link>
                ))}
              </div>
              <div className={styles.pagination}>
                <button onClick={() => setPaginaAtual(1)} disabled={paginaAtual === 1}>{'<<'}</button>
                <button
                  onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                >{'<'}</button>
                <span>
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaAtual === totalPaginas}
                >{'>'}</button>
                <button onClick={() => setPaginaAtual(totalPaginas)} disabled={paginaAtual === totalPaginas}>{'>>'}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
