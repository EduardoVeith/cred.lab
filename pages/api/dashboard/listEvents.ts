import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../../services/firebaseAdmin'; // usa a config do firebaseAdmin.ts

const db = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido ou mal formatado' });
    }

    const idToken = authHeader.split(' ')[1];

    // Verifica o token JWT do Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Buscar eventos no Firestore
    const eventsSnapshot = await db.collection('events').get();

    const events = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'indisponível',
        description: data.description || 'indisponível',
        category: data.category || 'indisponível',
        imageUrl: data.imageUrl || 'indisponível',
        startDate: data.startDate || 'indisponível',
        endDate: data.endDate || 'indisponível',
        createdAt: data.createdAt || 'indisponível',
        organizerId: data.organizerId || 'indisponível',
        guests: data.guests || [],
        address: data.address || { cep: 'indisponível', city: 'indisponível' },
      };
    });

    return res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
}
