// pages/api/dashboard/eventDetail.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../../services/firebaseAdmin';

const eventDetailHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    // Permite apenas o método GET
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Método ${req.method} não permitido` });
    }

    try {
        // Extrai o header de autorização e obtém o token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Cabeçalho de autorização ausente' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        // Valida o token usando o Firebase Admin
        await admin.auth().verifyIdToken(token);

        // Extrai o ID do evento a partir da query (ex: /api/dashboard/eventDetail?id=123)
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'ID do evento ausente ou inválido' });
        }

        // Lógica de acesso aos dados do evento diretamente aqui:
        const db = admin.firestore();
        const docRef = db.collection('events').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        // Prepara os dados do evento para retornar, incluindo o id do documento
        const eventData = { id: doc.id, ...doc.data() };

        return res.status(200).json(eventData);
    } catch (error: any) {
        console.error('Erro ao recuperar detalhes do evento:', error);
        return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
};

export default eventDetailHandler;
