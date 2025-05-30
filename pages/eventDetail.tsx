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
}

function EventDetailPage() {
    const { query, replace } = useRouter()
    const id = Array.isArray(query.id) ? query.id[0] : query.id
    const [eventData, setEventData] = useState<EventDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!id) return

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
                setEventData(data)
            } catch (error: unknown) {
                setError(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido')
            } finally {
                setLoading(false)
            }
        }

        fetchEventData()
    }, [id, replace])

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

    if (!eventData) {
        return (
            <div className={styles.container}>
                <p className={styles.notFoundText}>Nenhum evento encontrado.</p>
                <Link href="/eventList" className={styles.button}>
                    Voltar para a lista de eventos
                </Link>
            </div>
        )
    }

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