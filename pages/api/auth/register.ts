import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { firestore } from '../../../services/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { name, email, password, phone, cpf, birthDate, role } = req.body;

  // 🔍 Log dos dados recebidos antes da validação
  console.log('[DEBUG] Campos recebidos:', { name, email, password, phone, cpf, birthDate, role });

  if (!name || !email || !password || !phone || !cpf || !birthDate) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cpfRegex = /^\d{11}$/; // sem pontuação
  const phoneRegex = /^\d{11}$/; // ex: 81999998888
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,;:/?\s])[A-Za-z\d@$!%*?&.,;:/?\s]{8,}$/;
  const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de e-mail inválido.' });
  }
  let userRole: 'usuario' | 'produtor';

  if (role === 'user') {
    userRole = 'usuario';
  } else if (role === 'creator') {
    userRole = 'produtor';
  } else {
    return res.status(400).json({ error: 'Tipo de usuário inválido. Escolha "creator" ou "user".' });
  }
  if (!cpfRegex.test(cpf)) {
    return res.status(400).json({ error: 'Informe apenas números no CPF.' });
  }
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Informe apenas números no celular com DDD.' });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.' });
  }
  if (!birthDateRegex.test(birthDate)) {
    return res.status(400).json({ error: 'Formato de data inválido. Use YYYY-MM-DD.' });
  }

  const repeatedNumbersRegex = /(\d)\1{1,}/;
  if (repeatedNumbersRegex.test(password)) {
    return res.status(400).json({ error: 'A senha não pode conter números repetidos consecutivamente.' });
  }

  const birthDateObj = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  const dayDiff = today.getDate() - birthDateObj.getDate();

  if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
    return res.status(400).json({ error: 'Você deve ter 18 anos ou mais para criar uma conta.' });
  }

  try {
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

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await firestore.collection('users').doc(user.uid).set({
      name,
      email,
      phone,
      cpf,
      birthDate,
      role: userRole,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ uid: user.uid, email: user.email, message: 'Usuário cadastrado com sucesso' });
  } catch (error: any) {
    console.error(`Erro ao registrar usuário: ${error.message} - Dados: ${JSON.stringify(req.body)}`);
    res.status(500).json({ error: 'Erro interno ao registrar usuário. Tente novamente mais tarde.' });
  }
}
