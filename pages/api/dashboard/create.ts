import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { firestore } from '../../../services/firebaseAdmin';
import EventData from '../../../components/types/interfaceEventData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
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
    return res.status(401).json({ error: 'Token inválido.' });
  }

  const uid = decoded.uid;

  try {
    const userDoc = await firestore.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const userData = userDoc.data();
    const role = userData?.role || 'usuario';

    if (role !== 'produtor') {
      return res.status(403).json({ error: 'Apenas produtores podem criar eventos.' });
    }

    // Desestrutura os campos enviados no corpo da requisição
    const { title, imageUrl, category, startDate, endDate, description, address, guests }: EventData = req.body;

    // Verifica os campos obrigatórios
    if (!title || !category || !startDate || !endDate || !description || !address) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios do evento.' });
    }

    // Verifica os campos obrigatórios do endereço
    const { locationName, street, number, cep, neighborhood, city, state } = address;
    if (!locationName || !street || !number || !cep || !neighborhood || !city || !state) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios do endereço.' });
    }

    // Validação de datas: a data de início deve ser anterior à data de término
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        error: 'A data e horário de início devem ser anteriores à data e horário de término.',
      });
    }

    // Estrutura os dados do evento
    const eventData = {
      organizerId: uid,
      title,
      imageUrl: imageUrl || null, // campo opcional
      category,
      startDate,
      endDate,
      description,
      address: {
        locationName,
        street,
        number,
        cep,
        complement: address.complement || null, // opcional
        neighborhood,
        city,
        state,
      },
      guests: Array.isArray(guests) ? guests : [], // inicializa com array vazio se não fornecido
      createdAt: new Date().toISOString(),
    };

    const eventRef = await firestore.collection('events').add(eventData);
    res.status(201).json({ message: 'Evento criado com sucesso.', eventId: eventRef.id });
  } catch (error: any) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar o evento.' });
  }
}
