import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc, DocumentData } from 'firebase/firestore'
import { auth, db } from '../../services/firebase'
import styles from './ticketDetail.module.css'
import AuthGuard from '../../components/Auth/AuthGuard';

interface Address {
  street: string
  number: string
  complement?: string
  neighborhood?: string
  city: string
  state: string
}

interface TicketData {
  id: string
  eventId: string
  qrSvg: string
  userId: string
}

interface EventData {
  title: string
  date: string
  time: string
  description: string
  address: Address
}

const TicketDetailPage = () => {
  const router = useRouter()
  const { ticketId } = router.query
  const [user, setUser] = useState<User | null>(null)
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticketId) return

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setError('Você precisa estar logado.')
        setLoading(false)
        return
      }
      setUser(u)

      try {
        // 1) busca o ticket
        const tRef = doc(db, 'tickets', ticketId as string)
        const tSnap = await getDoc(tRef)
        if (!tSnap.exists()) {
          setError('Ingresso não encontrado.')
          setLoading(false)
          return
        }
        const t = tSnap.data() as DocumentData
        if (t.userId !== u.uid) {
          // acesso não-autorizado
          router.replace('/meus-tickets')
          return
        }
        setTicket({
          id: tSnap.id,
          eventId: t.eventId,
          qrSvg: t.qrSvg,
          userId: t.userId,
        })

        // 2) busca os dados do evento
        const eRef = doc(db, 'events', t.eventId)
        const eSnap = await getDoc(eRef)
        if (!eSnap.exists()) {
          setError('Dados do evento não encontrados.')
          setLoading(false)
          return
        }
        const e = eSnap.data() as DocumentData

        // formata startDate
        const raw = e.startDate
        const dt = raw?.toDate ? raw.toDate() : new Date(raw)
        const dateLabel = dt.toLocaleDateString('pt-BR')
        const timeLabel = dt.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })

        setEventData({
          title: e.title || '',
          date: dateLabel,
          time: timeLabel,
          description: e.description || '',
          address: {
            street: e.address?.street || '',
            number: e.address?.number || '',
            complement: e.address?.complement,
            neighborhood: e.address?.neighborhood,
            city: e.address?.city || '',
            state: e.address?.state || '',
          },
        })
      } catch (err: any) {
        console.error(err.code, err.message)
        setError('Erro ao carregar o ingresso.')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [ticketId, router])

  // loading
  if (loading) {
    return (
      <div className={styles.container}>
        <p>Carregando…</p>
      </div>
    )
  }

  // erro geral
  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
        <button
          className={styles.backButton}
          onClick={() => router.push('/meus-tickets')}
        >
          Voltar para Meus Ingressos
        </button>
      </div>
    )
  }

  return (
    <>
     <AuthGuard>
    
      <Head>
        <title>Meu Ingresso</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <header className={styles.header}>
        <h1 className={styles.logo}>TANC</h1>
        <div className={styles.profileIcon} />
      </header>

      <main className={styles.container}>
        <h2 className={styles.pageTitle}>Meu Ingresso</h2>
        <button
          className={styles.backButton}
          onClick={() => router.back()}
        >
          Voltar
        </button>

        <div className={styles.detailCard}>
          <div className={styles.detailRow}>{eventData!.title}</div>
          <div className={styles.detailRow}>
            Data: {eventData!.date} – {eventData!.time}
          </div>
          <div className={styles.detailRow}>
            Local: {eventData!.address.street}, {eventData!.address.number}
          </div>
          <div className={styles.detailRow}>
            Descrição: {eventData!.description}
          </div>
        </div>

        <img
          src={ticket!.qrSvg}
          alt="QR Code do ingresso"
          className={styles.qrImage}
        />
      </main>
      </AuthGuard>
    </>
  )
}

export default TicketDetailPage
