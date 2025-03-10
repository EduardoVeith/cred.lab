import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { firestore } from '../../../services/firebaseAdmin';
import admin from 'firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  let decoded: any;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const uid = decoded.uid;

  try {
    const userDoc = await firestore.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const userData = userDoc.data();
    const role = userData?.role || 'usuario';

    if (role === 'produtor') {
      const eventsSnapshot = await firestore
        .collection('events')
        .where('organizerId', '==', uid)
        .get();
      const events = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json({ role, events });
    } else {
      const registrationsSnapshot = await firestore
        .collection('registrations')
        .where('userID', '==', uid)
        .get();
      const eventIds = registrationsSnapshot.docs.map((doc) => doc.data().eventId);

      if (eventIds.length === 0) {
        return res.status(200).json({ role, events: [] });
      }

      const eventsQuerySnapshot = await firestore
        .collection('events')
        .where(admin.firestore.FieldPath.documentId(), 'in', eventIds)
        .get();
      const events = eventsQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).json({ role, events });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar os eventos.' });
  }
}
