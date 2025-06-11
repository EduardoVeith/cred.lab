// pages/api/tickets/listByEvent.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import admin, { firestore } from '../../../services/firebaseAdmin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' })
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.split('Bearer ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' })
  }

  let currentUserId: string
  try {
    const decodedToken = await admin.auth().verifyIdToken(token)
    currentUserId = decodedToken.uid
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' })
  }

  const { eventId } = req.query

  if (!eventId || typeof eventId !== 'string') {
    return res.status(400).json({ error: 'Parâmetro eventId é obrigatório' })
  }

  try {
    // verifica se o usuário é o organizador
    const eventRef = firestore.collection('events').doc(eventId)
    const eventSnap = await eventRef.get()

    if (!eventSnap.exists) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    const eventData = eventSnap.data()
    if (eventData?.organizerId !== currentUserId) {
      return res.status(403).json({ error: 'Você não tem permissão para acessar esta informação' })
    }

    // busca os tickets
    const ticketsSnap = await firestore.collection('tickets')
      .where('eventId', '==', eventId)
      .get()

    const tickets = await Promise.all(
      ticketsSnap.docs.map(async doc => {
        const data = doc.data()
        let userEmail = 'Desconhecido'

        try {
          const userRecord = await admin.auth().getUser(data.userId)
          userEmail = userRecord.email || 'Desconhecido'
        } catch (e) {
          console.warn('Não foi possível buscar o email de:', data.userId)
        }

        return {
          userEmail,
          qrSvg: data.qrSvg,
          used: data.used,
          createdAt: data.createdAt.toDate(), // converte para date
        }
      })
    )

    return res.status(200).json({ tickets })
  } catch (err) {
    console.error('Erro ao listar tickets:', err)
    return res.status(500).json({ error: 'Erro interno ao listar tickets' })
  }
}
