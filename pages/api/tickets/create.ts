import type { NextApiRequest, NextApiResponse } from 'next'
import admin, { firestore } from '../../../services/firebaseAdmin'
import { randomBytes, randomUUID } from 'crypto'
import { generateQRCodeSVG } from 'qrmanual'

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
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { userId, eventId } = req.body as {
    userId?: string
    eventId?: string
  }
  if (!userId || !eventId) {
    return res
      .status(400)
      .json({ error: 'userId e eventId são obrigatórios' })
  }

  // Verifica se já existe um ingresso
  const existing = await firestore
    .collection('tickets')
    .where('userId', '==', userId)
    .where('eventId', '==', eventId)
    .limit(1)
    .get()

  if (!existing.empty) {
    return res
      .status(409)
      .json({ error: 'O usuário já possui um ingresso para este evento' })
  }

  // Gera token
  const token = randomBytes(16).toString('hex')

  // Gera o SVG do QR Code
  const svg = generateQRCodeSVG(token)
  const qrSvg =
    'data:image/svg+xml;base64,' +
    Buffer.from(svg).toString('base64')

  // obj do tiket
  const ticket: Ticket = {
    id: randomUUID(),
    userId,
    eventId,
    token,
    qrSvg,
    used: false,
    createdAt: admin.firestore.Timestamp.now(),
  }

  await firestore
    .collection('tickets')
    .doc(ticket.id)
    .set(ticket)

  return res.status(201).json({ ticket })
}
