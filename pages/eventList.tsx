import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import CardEvento from '../components/Layout/CardEvento';
import styles from '../styles/eventList.module.scss';
import { FiFilter, FiPlus, FiCalendar, FiLogOut, FiX, FiClock } from 'react-icons/fi';
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
  const [showFilter, setShowFilter] = useState(false);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);

  const eventosPorPagina = 12;

  const isEventPast = (eventDate: string) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    return eventDateObj < now;
  };

  const eventosFiltradosOrdenados = useMemo(() => {
    let filtered = [...eventos];
    
    if (!showPastEvents) {
      filtered = filtered.filter(evt => new Date(evt.endDate) >= new Date());
    } else {
      filtered = filtered.filter(evt => isEventPast(evt.endDate));
    }
    
    if (filterTitle) {
      filtered = filtered.filter(evt => 
        evt.title.toLowerCase().includes(filterTitle.toLowerCase())
      );
    }
    
    if (filterLocation) {
      filtered = filtered.filter(evt => 
        evt.locationName.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [eventos, filterTitle, filterLocation, showPastEvents]);

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
          locationName: evt.address?.locationName ?? 'Indisponível',
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

  const totalPaginas = Math.ceil(eventosFiltradosOrdenados.length / eventosPorPagina);
  const eventosPaginados = eventosFiltradosOrdenados.slice(
    (paginaAtual - 1) * eventosPorPagina,
    paginaAtual * eventosPorPagina
  );

  function resetFilters() {
    setFilterTitle('');
    setFilterLocation('');
    setShowPastEvents(false);
    setPaginaAtual(1);
  }

  async function handleLogout() {
    const auth = getAuth(firebaseApp);
    await signOut(auth);
    window.location.href = '/login';
  }

  return (
    <AuthGuard>
      <div className={styles.dashboardContainer}>
        <div className={styles.barraTanc}>TANC</div>
        <div className={styles.contentWrapper}>
          <div className={styles.topBar}>
            <div className={styles.filterContainer}>
              <button 
                className={styles.filterButton}
                onClick={() => setShowFilter(!showFilter)}
              >
                <FiFilter className={styles.filterIcon} />
                Filtros
              </button>
              {showFilter && (
                <div className={styles.filterDropdown}>
                  <div className={styles.filterHeader}>
                    <h4>Filtrar Eventos</h4>
                    <button 
                      onClick={() => setShowFilter(false)}
                      className={styles.closeButton}
                    >
                      <FiX />
                    </button>
                  </div>
                  <div className={styles.filterGroup}>
                    <label>Título:</label>
                    <input
                      type="text"
                      value={filterTitle}
                      onChange={(e) => setFilterTitle(e.target.value)}
                      placeholder="Filtrar por título"
                    />
                  </div>
                  <div className={styles.filterGroup}>
                    <label>Local:</label>
                    <input
                      type="text"
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      placeholder="Filtrar por local"
                    />
                  </div>
                  <div className={styles.filterActions}>
                    <button
                      onClick={() => setShowPastEvents(!showPastEvents)}
                      className={`${styles.showPastButton} ${showPastEvents ? styles.active : ''}`}
                    >
                      <FiClock />
                      {showPastEvents ? 'Ocultar Passados' : 'Mostrar Passados'}
                    </button>
                    <button 
                      onClick={resetFilters}
                      className={styles.resetButton}
                    >
                      Limpar Filtros
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.buttonsGroup}>
              <button
                className={`${styles.actionButton}`}
                onClick={() => (window.location.href = '/eventRegister')}
              >
                <FiPlus />
                Promover Evento
              </button>
              <button
                className={`${styles.actionButton}`}
                onClick={() => (window.location.href = '/events')}
              >
                <FiCalendar />
                Meus Eventos
              </button>
              <button
                className={`${styles.actionButton} ${styles.logoutButton}`}
                onClick={handleLogout}
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>Carregando eventos...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <>
              <div className={styles.eventsGrid}>
                {eventosPaginados.length > 0 ? (
                  eventosPaginados.map(evt => (
                    <Link
                      key={evt.id}
                      href={`/eventDetail?id=${evt.id}`}
                      className={styles.cardWrapper}
                    >
                      <CardEvento
                        nome={evt.title}
                        endereco={evt.locationName}
                        dataHora={evt.startDate}
                        isPast={isEventPast(evt.endDate)}
                      />
                    </Link>
                  ))
                ) : (
                  <div className={styles.noResults}>
                    Nenhum evento encontrado com os filtros atuais.
                  </div>
                )}
              </div>
              <div className={styles.pagination}>
                <button 
                  onClick={() => setPaginaAtual(1)} 
                  disabled={paginaAtual === 1}
                >
                  {'<<'}
                </button>
                <button
                  onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                >
                  {'<'}
                </button>
                <span>
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaAtual === totalPaginas}
                >
                  {'>'}
                </button>
                <button 
                  onClick={() => setPaginaAtual(totalPaginas)} 
                  disabled={paginaAtual === totalPaginas}
                >
                  {'>>'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}