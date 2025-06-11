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
  // 1.1) valida autenticação do criador, para que nenhum outro usuário possa criar ingressos
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


  // 2) Valida parâmetros
  const { userEmail, eventId } = req.body as {
  userEmail?: string
  eventId?: string
}

  if (!userEmail || !eventId) {
  return res.status(400).json({ error: 'userEmail e eventId são obrigatórios' })
}
  const userSnapshot = await admin.auth().getUserByEmail(userEmail).catch(() => null)

  if (!userSnapshot) {
    return res.status(404).json({ error: 'Usuário não encontrado' })
  }

  const userId = userSnapshot.uid

  // 2.1)busca o evento e verifica se o usuário atual é o criador
  const eventRef = firestore.collection('events').doc(eventId)
  const eventSnap = await eventRef.get()

  if (!eventSnap.exists) {
    return res.status(404).json({ error: 'Evento não encontrado' })
  }

  const eventData = eventSnap.data()

  if (eventData?.organizerId !== currentUserId) {
    return res.status(403).json({ error: 'Você não tem permissão para adicionar ingressos a este evento' })
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
