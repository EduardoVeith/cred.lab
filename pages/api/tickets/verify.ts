import type { NextApiRequest, NextApiResponse } from 'next'
import admin, { firestore } from '../../../services/firebaseAdmin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  const { ticketId } = req.body as { ticketId?: string }
  if (!ticketId) {
    return res.status(400).json({ error: 'Parâmetro ticketId é obrigatório' })
  }

  try {
    const ref = firestore.collection('tickets').doc(ticketId)
    const snap = await ref.get()

    if (!snap.exists) {
      return res.status(404).json({ valid: false, reason: 'Ingresso não encontrado' })
    }

    const data = snap.data()!
    if (data.used) {
      return res.status(410).json({ valid: false, reason: 'Ingresso já utilizado' })
    }

    // Marca como usado
    await ref.update({
      used: true,
      usedAt: admin.firestore.Timestamp.now(),
    })

    return res.status(200).json({
      valid: true,
      userId: data.userId,
      eventId: data.eventId,
    })
  } catch (err: any) {
    console.error('Erro na verificação de ticket:', err)
    return res.status(500).json({ error: 'Erro interno ao verificar ticket' })
  }
}
