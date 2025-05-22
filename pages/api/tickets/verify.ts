import type { NextApiRequest, NextApiResponse } from 'next'
import admin, { firestore } from '../../../services/firebaseAdmin'

interface VerifyResponse {
  valid: boolean
  reason?: string
  userId?: string
  eventId?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse>
) {
  // 1) Só POST
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ valid: false, reason: 'Only POST allowed' })
  }

  // 2) Parâmetro obrigatório: aqui ticketId é na verdade o token
  const { ticketId: token } = req.body as { ticketId?: string }
  if (!token) {
    return res
      .status(400)
      .json({ valid: false, reason: 'Parâmetro ticketId é obrigatório' })
  }

  try {
    // 3) Busca o ticket pelo campo `token`
    const q = await firestore
      .collection('tickets')
      .where('token', '==', token)
      .limit(1)
      .get()

    // 4) Ingresso não encontrado
    if (q.empty) {
      return res
        .status(404)
        .json({ valid: false, reason: 'Ingresso não encontrado' })
    }

    // 5) Pega o documento e seus dados
    const doc = q.docs[0]
    const data = doc.data()!

    // 6) Se já foi usado
    if (data.used) {
      return res
        .status(410)
        .json({ valid: false, reason: 'Ingresso já utilizado' })
    }

    // 7) Marca como usado
    await doc.ref.update({
      used: true,
      usedAt: admin.firestore.Timestamp.now(),
    })

    // 8) Retorna sucesso
    return res.status(200).json({
      valid: true,
      userId: data.userId,
      eventId: data.eventId,
    })
  } catch (err: any) {
    console.error('Erro na verificação de ticket:', err)
    return res
      .status(500)
      .json({ valid: false, reason: 'Erro interno ao verificar ticket' })
  }
}
