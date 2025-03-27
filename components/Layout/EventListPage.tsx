import { useEffect, useState } from 'react';
import CardEvento from '../../components/Layout/CardEvento';
import styles from '../styles/Home.module.scss';
import { FiUser, FiFilter } from 'react-icons/fi';
import { getAuth } from 'firebase/auth';
import firebaseApp from '../../services/firebase';

interface Evento {
  id: string;
  title: string;
  locationName: string;
}

export default function EventListPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const eventosPorPagina = 12;

  useEffect(() => {
    const fetchEventos = async () => {
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;

      if (!user) {
        console.warn('Usuário não autenticado');
        return;
      }

      try {
        const token = await user.getIdToken();

        if (!token) {
          console.warn('Token inválido');
          return;
        }

        const res = await fetch('/api/dashboard/listEvents', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error('Erro da API:', await res.text());
          return;
        }

        const data = await res.json();
        const eventosFormatados = data.map((evento: any) => ({
          id: evento.id,
          title: evento.title || 'indisponível',
          locationName: evento.address?.city || 'indisponível',
        }));

        setEventos(eventosFormatados);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      }
    };

    fetchEventos();
  }, []);

  const totalPaginas = Math.ceil(eventos.length / eventosPorPagina);
  const eventosPaginados = eventos.slice(
    (paginaAtual - 1) * eventosPorPagina,
    paginaAtual * eventosPorPagina
  );

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.barraTanc}>TANC</div>

      <div style={{ marginTop: '80px' }}>
        <div className={styles.header}>
          <FiUser className={styles.profileIcon} />
        </div>

        <div className={styles.topBar}>
          <FiFilter className={styles.filterIcon} />
          <button className={styles.promoteButton}>Promover Evento</button>
        </div>

        <div className={styles.eventsGrid}>
          {eventosPaginados.map((evento) => (
            <CardEvento
              key={evento.id}
              nome={evento.title}
              endereco={evento.locationName}
            />
          ))}
        </div>

        <div className={styles.pagination}>
          <button onClick={() => setPaginaAtual(1)} disabled={paginaAtual === 1}>
            {'<<'}
          </button>
          <button
            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
          >
            {'<'}
          </button>
          <span>
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
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
      </div>
    </div>
  );
}
