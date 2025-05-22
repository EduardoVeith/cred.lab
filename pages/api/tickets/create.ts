import type { NextApiRequest, NextApiResponse } from 'next'
import admin, { firestore } from '../../../services/firebaseAdmin'
import { randomBytes, randomUUID } from 'crypto'
import QRCode from 'qrcode'

interface Ticket {
  id: string
  userId: string
  eventId: string
  token: string
  qrSvg: string
  used: boolean
  createdAt: admin.firestore.Timestamp
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1) Só POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  // 2) Valida parâmetros
  const { userId, eventId } = req.body as {
    userId?: string
    eventId?: string
  }
  if (!userId || !eventId) {
    return res
      .status(400)
      .json({ error: 'userId e eventId são obrigatórios' })
  }

  try {
    // 3) Evita duplicatas
    const existing = await firestore
      .collection('tickets')
      .where('userId', '==', userId)
      .where('eventId', '==', eventId)
      .limit(1)
      .get()
    if (!existing.empty) {
      return res
        .status(409)
        .json({ error: 'O usuário já possui ingresso para este evento' })
    }

    // 4) Gera token único
    const token = randomBytes(16).toString('hex')

    // 5) Gera SVG do QR Code com 'qrcode'
    //    - type: 'svg' para SVG
    //    - errorCorrectionLevel: 'H' para máxima redundância
    //    - margin: 4 (quiet-zone de 4 módulos)
    //    - width: 300px (aprox. 10px × 25 módulos)
    const svgString = await QRCode.toString(token, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 300,
    })
    // embrulha em Data URI base64
    const qrSvg =
      'data:image/svg+xml;base64,' + Buffer.from(svgString).toString('base64')

    // 6) Monta o objeto Ticket
    const ticket: Ticket = {
      id: randomUUID(),
      userId,
      eventId,
      token,
      qrSvg,
      used: false,
      createdAt: admin.firestore.Timestamp.now(),
    }

    // 7) Salva no Firestore
    await firestore.collection('tickets').doc(ticket.id).set(ticket)

    // 8) Retorna o ticket
    return res.status(201).json({ ticket })
  } catch (err: any) {
    console.error('Erro ao criar ingresso:', err)
    return res
      .status(500)
      .json({ error: 'Erro interno ao criar ingresso' })
  }
}
