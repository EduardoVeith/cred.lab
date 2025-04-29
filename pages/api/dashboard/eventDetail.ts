// pages/api/dashboard/eventDetail.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import admin from '../../../services/firebaseAdmin'

// —————————————————————————————————————————————
// Extrai e verifica o Bearer token, lançando erro com status
// —————————————————————————————————————————————
export async function verifyTokenFromHeader(authHeader?: string) {
    if (!authHeader?.startsWith('Bearer ')) {
        const e = new Error('BAD_AUTH_HEADER')
            ; (e as any).status = 401
        throw e
    }
    const token = authHeader.split(' ')[1]
    if (!token) {
        const e = new Error('NO_TOKEN')
            ; (e as any).status = 401
        throw e
    }
    // se quiser, pode retornar o decoded token:
    await admin.auth().verifyIdToken(token)
}

// —————————————————————————————————————————————
// Busca o evento pelo ID no Firestore, lançando erro com status
// —————————————————————————————————————————————
export async function fetchEventById(id?: string) {
    if (!id) {
        const e = new Error('NO_ID')
            ; (e as any).status = 400
        throw e
    }
    const doc = await admin.firestore().collection('events').doc(id).get()
    if (!doc.exists) {
        const e = new Error('NOT_FOUND')
            ; (e as any).status = 404
        throw e
    }
    return { id: doc.id, ...(doc.data() as Record<string, any>) }
}

// —————————————————————————————————————————————
// Handler da rota, só orquestra as duas funções acima
// —————————————————————————————————————————————
export default async function eventDetailHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method !== 'GET') {
            res.setHeader('Allow', 'GET')
            return res.status(405).end()
        }

        await verifyTokenFromHeader(req.headers.authorization)
        const id = Array.isArray(req.query.id)
            ? req.query.id[0]
            : req.query.id
        const event = await fetchEventById(id)
        return res.status(200).json(event)
    } catch (err: any) {
        const status = err.status || 500
        return res.status(status).json({ error: err.message })
    }
}
