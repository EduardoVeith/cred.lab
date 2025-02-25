import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { firestore } from '../../../services/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { name, email, password, phone, cpf, birthDate } = req.body;

  if (!name || !email || !password || !phone || !cpf || !birthDate) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  // Verificação de formato dos campos
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,;:/?\s])[A-Za-z\d@$!%*?&.,;:/?\s]{8,}$/;
  const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de e-mail inválido.' });
  }
  if (!cpfRegex.test(cpf)) {
    return res.status(400).json({ error: 'Formato de CPF inválido. Use XXX.XXX.XXX-XX.' });
  }
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Formato de telefone inválido. Use (XX) XXXXX-XXXX.' });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.' });
  }
  if (!birthDateRegex.test(birthDate)) {
    return res.status(400).json({ error: 'Formato de data inválido. Use YYYY-MM-DD.' });
  }

  // Validação de idade mínima
  const birthDateObj = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  const dayDiff = today.getDate() - birthDateObj.getDate();

  if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
    return res.status(400).json({ error: 'Você deve ter 18 anos ou mais para criar uma conta.' });
  }

  try {
    // Verificações de duplicidade no Firestore
    const emailSnapshot = await firestore.collection('users').where('email', '==', email).get();
    if (!emailSnapshot.empty) {
      return res.status(400).json({ error: 'E-mail já cadastrado. Faça login ou use outro e-mail.' });
    }

    const cpfSnapshot = await firestore.collection('users').where('cpf', '==', cpf).get();
    if (!cpfSnapshot.empty) {
      return res.status(400).json({ error: 'CPF já cadastrado.' });
    }

    const phoneSnapshot = await firestore.collection('users').where('phone', '==', phone).get();
    if (!phoneSnapshot.empty) {
      return res.status(400).json({ error: 'Telefone já cadastrado.' });
    }

    // Criar usuário no Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await firestore.collection('users').doc(user.uid).set({
      name,
      email,
      phone,
      cpf,
      birthDate,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ uid: user.uid, email: user.email, message: 'Usuário cadastrado com sucesso' });
  } catch (error: any) {
    console.error(`Erro ao registrar usuário: ${error.message} - Dados recebidos: ${JSON.stringify(req.body)}`);
    res.status(500).json({ error: 'Erro interno ao registrar usuário. Tente novamente mais tarde.' });
  }
}
