import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { onAuthStateChanged, User } from 'firebase/auth'
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
import TicketCard, { Address } from '../components/tickets/TicketCard'
import pageStyles from './meus-tickets.module.css'

interface RawTicket {
  id: string
  eventId: string
  qrSvg: string
}

interface TicketWithEvent extends RawTicket {
  title: string
  address: Address
}

const MeusTicketsPage: NextPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [tickets, setTickets] = useState<TicketWithEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // controles de paginação (exemplo simples)
  const [page, setPage] = useState(1)
  const perPage = 8
  const totalPages = Math.ceil(tickets.length / perPage)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null)
        setLoading(false)
        return
      }
      setUser(u)

      try {
        // 1) busca tickets do usuário
        const snap = await getDocs(
          query(collection(db, 'tickets'), where('userId', '==', u.uid))
        )
        const raw: RawTicket[] = snap.docs.map((d) => {
          const dta = d.data() as DocumentData
          return { id: d.id, eventId: dta.eventId, qrSvg: dta.qrSvg }
        })

        // 2) enriquece com dados do evento
        const enriched = await Promise.all(
          raw.map(async (t) => {
            const evSnap = await getDoc(doc(db, 'events', t.eventId))
            const ev = evSnap.exists() ? (evSnap.data() as DocumentData) : {}
            const address: Address = {
              street: ev.address?.street || '—',
              number: ev.address?.number || '—',
              complement: ev.address?.complement,
              neighborhood: ev.address?.neighborhood,
              city: ev.address?.city || '',
              state: ev.address?.state || '',
            }
            return {
              ...t,
              title: ev.title || 'Evento sem título',
              address,
            }
          })
        )

        setTickets(enriched)
      } catch (err: any) {
        console.error(err.code, err.message)
        setError('Não foi possível carregar seus ingressos.')
      } finally {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando seus ingressos…</p>
      </div>
    )
  if (!user)
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <p>Você precisa estar logado para ver esta página.</p>
      </div>
    )

  const start = (page - 1) * perPage
  const visible = tickets.slice(start, start + perPage)

  return (
    <>
      <Head>
        <title>Meus Ingressos</title>
      </Head>
      <main className={pageStyles.container}>
        <h1 className={pageStyles.pageTitle}>Meus ingressos</h1>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <div className={pageStyles.grid}>
          {visible.map((t) => (
            <TicketCard
              key={t.id}
              ticketId={t.id}
              title={t.title}
              address={t.address}
            />
          ))}
        </div>

        {tickets.length > perPage && (
          <div className={pageStyles.pagination}>
            <button
              className={pageStyles.pageButton}
              disabled={page === 1}
              onClick={() => setPage(1)}
            >
              ««
            </button>
            <button
              className={pageStyles.pageButton}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>

            <span className={pageStyles.pageInfo}>
              Página {page} de {totalPages}
            </span>

            <button
              className={pageStyles.pageButton}
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
            <button
              className={pageStyles.pageButton}
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
            >
              »»
            </button>
          </div>
        )}
      </main>
    </>
  )
}

export default MeusTicketsPage
