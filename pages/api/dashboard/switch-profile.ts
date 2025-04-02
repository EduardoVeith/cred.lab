import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { firestore } from '../../../services/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Formato do token inválido. Deve começar com "Bearer "' });
  }

  const token = authHeader.split(' ')[1];

  // Debug temporário
  console.log('Token recebido:', token);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);

  let decoded: any;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    console.error('Erro ao verificar o token:', error);
    return res.status(401).json({ error: 'Token inválido.' });
  }

  const uid = decoded.uid;

  try {
    const userRef = firestore.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const userData = userDoc.data();
    const currentRole = userData?.role || 'usuario';
    const newRole = currentRole === 'usuario' ? 'produtor' : 'usuario';

    console.log(`Alterando perfil do usuário ${uid} de ${currentRole} para ${newRole}`);
    await userRef.update({ role: newRole });

    res.status(200).json({ message: 'Perfil alterado com sucesso.', role: newRole });
  } catch (error) {
    console.error('Erro no Firebase:', error);
    res.status(500).json({ error: 'Erro ao alterar o perfil.' });
  }
}
