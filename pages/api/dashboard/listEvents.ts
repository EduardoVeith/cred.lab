import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

// Inicializar Firebase apenas uma vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();
const auth = admin.auth();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const uid = req.headers.authorization; // Pega o UID diretamente do cabeçalho

    if (!uid) {
      return res.status(401).json({ error: 'UID não fornecido' });
    }

    // Verifica se o UID existe no Firebase Authentication
    const userRecord = await auth.getUser(uid).catch(() => null);
    if (!userRecord) {
      return res.status(403).json({ error: 'Usuário não encontrado' });
    }

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

    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
}
