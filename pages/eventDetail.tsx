import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getAuth } from 'firebase/auth'
import firebaseApp from '../services/firebase'
import AuthGuard from '../components/Auth/AuthGuard'
import Link from 'next/link'
import styles from '../styles/eventDetail.module.scss'
import { FiCalendar, FiClock, FiInfo } from 'react-icons/fi'

interface EventDetail {
    id: string
    title: string
    description: string
    startDate: string
    endDate: string
    organizerId: string
}

function EventDetailPage() {
    const { query, replace } = useRouter()
    const id = Array.isArray(query.id) ? query.id[0] : query.id
    const [eventData, setEventData] = useState<EventDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [linkMessage, setLinkMessage] = useState('')
    type LinkedUser = {
    userEmail: string
    qrSvg: string
    used: boolean
    createdAt: Date
}

    const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([])
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    useEffect(() => {
        if (!id) {   
        console.log('id do evento ', id)
        return
         }
        const fetchEventData = async () => {
            setLoading(true)
            setError('')
            try {
                const auth = getAuth(firebaseApp)
                const user = auth.currentUser
                
                if (!user) {
                    replace('/login')
                    return
                }
                
                setCurrentUserId(user.uid)
   
                const token = await user.getIdToken()
                const response = await fetch(
                    `/api/dashboard/eventDetail?id=${id}`,
                    { 
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        } 
                    }
                )

                if (!response.ok) {
                    if (response.status === 404) {
                        replace('/404')
                        return
                    }
                    throw new Error(await response.text() || 'Falha ao carregar dados do evento')
                }

                const data: EventDetail = await response.json()
                console.log('Dados do evento', data)
                
                setEventData(data)
            } catch (error: unknown) {
                setError(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido')
            } finally {
                setLoading(false)
            }
        }

        fetchEventData()
        fetchLinkedUsers()
    }, [id, replace])

    const fetchLinkedUsers = async () => {
    try {
    const auth = getAuth(firebaseApp)
    const user = auth.currentUser
    if (!user) return replace('/login')

    const token = await user.getIdToken()
    const res = await fetch(`/api/tickets/listByEvent?eventId=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) throw new Error('Erro ao buscar usuários vinculados.')

    const data: { tickets: LinkedUser[] } = await res.json()
    setLinkedUsers(data.tickets.map(ticket => ({
      ...ticket,
      createdAt: new Date(ticket.createdAt)
    })))
  } catch (error) {
    console.error(error)
  }
}

        const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLinkMessage('')

        try {
            const auth = getAuth(firebaseApp)
            const user = auth.currentUser
            if (!user) return replace('/login')

            const token = await user.getIdToken()

            const res = await fetch('/api/tickets/create', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userEmail,
                    eventId: id,
                }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Erro ao vincular usuário.')

            setLinkMessage('Usuário vinculado com sucesso!')
            setUserEmail('')
        } catch (err: any) {
            setLinkMessage(err.message || 'Erro ao vincular usuário.')
        }
    }
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }
        return new Date(dateString).toLocaleString('pt-BR', options)
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>Carregando detalhes do evento...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorMessage}>
                    <p className={styles.errorText}>Erro ao carregar evento</p>
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className={styles.button}
                    >
                        Tentar novamente
                    </button>
                    <Link href="/eventList" className={styles.secondaryButton}>
                        Voltar para lista
                    </Link>
                </div>
            </div>
        )
    }

    if (loading || !eventData || !currentUserId) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>Carregando detalhes do evento...</p>
            </div>
        )
    }

<p style={{ color: 'gray', fontSize: '0.9rem' }}>
  <strong>DEBUG:</strong> currentUserId = {currentUserId}, organizerId = {eventData.organizerId}
</p>

    return (
        <>
            <header className={styles.barra_tanc}>TANC</header>
            <div className={styles.backButtonTop}>
                <Link href="/eventList" className={styles.button}>
                    Voltar
                </Link>
            </div>

            <main className={styles.container}>
                <h1 className={styles.eventTitle}>{eventData.title}</h1>
                
                <div className={styles.eventCard}>
                    {eventData?.organizerId && currentUserId && currentUserId === eventData.organizerId && (
                    <section className={styles.eventSection}>
                        <h2 className={styles.sectionTitle}>Vincular Usuário ao Evento</h2>
                        <form onSubmit={handleSubmit} className={styles.linkForm}>
                        <input
                            type="email"
                            placeholder="Email do usuário"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <button type="submit" className={styles.button}>Vincular</button>
                        </form>
                        {linkMessage && <p className={styles.linkMessage}>{linkMessage}</p>}
                    </section>
                    )}
                    <section className={styles.eventSection}>
                        <h2 className={styles.sectionTitle}>
                            <FiCalendar size={20} className={styles.icon} />
                            Detalhes do Evento
                        </h2>
                        <div className={styles.detailItem}>
                            <FiClock size={18} className={styles.icon} />
                            <div>
                                <p className={styles.detailLabel}>Período:</p>
                                <p className={styles.detailValue}>
                                    {formatDate(eventData.startDate)}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.eventSection}>
                        <h2 className={styles.sectionTitle}>
                            <FiInfo size={20} className={styles.icon} />
                            Sobre o Evento
                        </h2>
                        <p className={styles.eventDescription}>{eventData.description}</p>
                    </section>
                    <section className={styles.eventSection}>
                        <h2 className={styles.sectionTitle}>👥 Usuários Vinculados</h2>
                        {linkedUsers.length === 0 ? (
                            <p className={styles.detailValue}>Nenhum usuário vinculado ainda.</p>
                        ) : (
                            <ul className={styles.linkedUsersList}>
                            {linkedUsers.map((user, index) => (
                                <li key={index} className={styles.linkedUserItem}>
                                <p><strong>Email:</strong> {user.userEmail}</p>
                                <p><strong>Utilizado:</strong> {user.used ? 'Sim' : 'Não'}</p>
                                <p><strong>Adicionado em:</strong> {formatDate(user.createdAt.toString())}</p>
                                </li>
                            ))}
                            </ul>
                        )}
                </section>
                </div>
            </main>
        </>
    )
}

export default function ProtectedEventDetail() {
    return (
        <AuthGuard>
            <EventDetailPage />
        </AuthGuard>
    )
}