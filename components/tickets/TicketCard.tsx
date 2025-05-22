import React from 'react'
import Link from 'next/link'
import styles from './TicketCard.module.css'

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood?: string
  city: string
  state: string
}

interface TicketCardProps {
  ticketId: string
  title: string
  address: Address
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticketId,
  title,
  address,
}) => (
  <div className={styles.card}>
    <h2 className={styles.title}>{title}</h2>
    <p className={styles.location}>
      Local: {address.street}, {address.number}
    </p>
    <Link href={`/tickets/${ticketId}`} className={styles.link}>
      Visualizar Ingresso
    </Link>
  </div>
)

export default TicketCard
