import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getAuth } from 'firebase/auth'
import firebaseApp from '../services/firebase'
import AuthGuard from '../components/Auth/AuthGuard'
import Link from 'next/link'
import styles from '../styles/eventDetail.module.scss'

interface EventDetail {
    id: string
    title: string
    description: string
    category: string
    imageUrl?: string
    startDate: string
    endDate: string
}

function EventDetailPage() {
    const { query, replace } = useRouter()
    const id = Array.isArray(query.id) ? query.id[0] : query.id
    const [eventData, setEventData] = useState<EventDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!id) return
            ; (async () => {
                setLoading(true)
                try {
                    const auth = getAuth(firebaseApp)
                    const user = auth.currentUser
                    if (!user) throw new Error('Usuário não autenticado')
                    const token = await user.getIdToken()
                    const resp = await fetch(
                        `/api/dashboard/eventDetail?id=${id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                    if (!resp.ok) {
                        if (resp.status === 404) return replace('/404')
                        throw new Error(await resp.text())
                    }
                    setEventData(await resp.json())
                } catch (e: any) {
                    setError(e.message)
                } finally {
                    setLoading(false)
                }
            })()
    }, [id, replace])

    if (loading)
        return <div className={styles.container}>Carregando…</div>
    if (error)
        return <div className={styles.container}>Erro: {error}</div>
    if (!eventData)
        return <div className={styles.container}>Nenhum evento encontrado.</div>

     return (
  <>
    <div className={styles.barra_tanc}>TANC</div>
    <div className={styles.backButtonTop}>
      <Link href="/eventList" className={styles.button}>
        Voltar
      </Link>
    </div>

        <div className={styles.container}>
      <h2 className={styles.eventTitle}>{eventData.title}</h2>
      <div className={styles.eventDetails}>
        <p><strong>Descrição:</strong> {eventData.description}</p>
        <p><strong>Categoria:</strong> {eventData.category}</p>
        <p><strong>Início:</strong> {new Date(eventData.startDate).toLocaleString('pt-BR')}</p>
        <p><strong>Término:</strong> {new Date(eventData.endDate).toLocaleString('pt-BR')}</p>
      </div>
      {eventData.imageUrl && (
        <img 
          src={eventData.imageUrl}
          alt={eventData.title}
          className={styles.eventImage}
        />
      )}
    </div>
  </>
);
}

export default function ProtectedEventDetail() {
    return (
        <AuthGuard>
            <EventDetailPage />
        </AuthGuard>
    )
}
