// pages/api/dashboard/events.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '../../../services/firebaseAdmin';
import admin from 'firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }
  const idToken = authHeader.split(' ')[1];

  let decodedToken: admin.auth.DecodedIdToken;
  try {
    // Verifica o ID token junto ao Firebase Admin SDK
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido.' });
  }

  const uid = decodedToken.uid;

  try {
    // 1) Eventos que eu criei
    const createdSnap = await firestore
      .collection('events')
      .where('organizerId', '==', uid)
      .get();
    const createdEvents = createdSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2) Eventos que eu tenho ingresso
    const regSnap = await firestore
      .collection('registrations')
      .where('userID', '==', uid)
      .get();
    const eventIds = regSnap.docs.map(d => d.data().eventId as string);

    let participatingEvents: any[] = [];
    if (eventIds.length > 0) {
      const partSnap = await firestore
        .collection('events')
        .where(admin.firestore.FieldPath.documentId(), 'in', eventIds)
        .get();
      participatingEvents = partSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return res.status(200).json({ createdEvents, participatingEvents });
  } catch (err) {
    console.error('Erro ao buscar eventos:', err);
    return res.status(500).json({ error: 'Erro ao buscar eventos.' });
  }
}
