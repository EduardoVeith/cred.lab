import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import jwt from 'jsonwebtoken';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    console.warn(`[${new Date().toISOString()}] Método inválido usado: ${req.method}`);
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    console.warn(`[${new Date().toISOString()}] Requisição incompleta - Email ou senha ausente.`);
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  // Validação do e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.warn(`[${new Date().toISOString()}] E-mail inválido recebido: ${email}`);
    return res.status(400).json({ error: 'Formato de e-mail inválido.' });
  }

  try {
    // Tentar login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const payload = {
      uid: user.uid,
      email: user.email,
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error(`[${new Date().toISOString()}] JWT_SECRET não definido nas variáveis de ambiente.`);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }

    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: '4h',
      algorithm: 'HS256',
    });

    console.log(`[${new Date().toISOString()}] Login bem-sucedido para o e-mail: ${email}`);

    return res.status(200).json({
      uid: user.uid,
      email: user.email,
      token,
      message: 'Login realizado com sucesso',
    });
  } catch (error: any) {
    const firebaseError = error.code || error.message;
  
    if (firebaseError === 'auth/user-not-found') {
      console.warn(`[${new Date().toISOString()}] Tentativa de login com e-mail não cadastrado: ${email}`);
      return res.status(401).json({
        error: 'E-mail não cadastrado. Clique em "Cadastre-se" para criar uma conta.',
      });
    }
  
    if (
      firebaseError === 'auth/wrong-password' ||
      firebaseError === 'auth/invalid-credential'
    ) {
      console.warn(`[${new Date().toISOString()}] Credenciais inválidas para o e-mail: ${email}`);
      return res.status(401).json({ error: 'E-mail ou senha incorretos. Tente novamente.' });
    }
  
    console.error(`[${new Date().toISOString()}] Erro inesperado no login: ${firebaseError} - Email: ${email}`);
    return res.status(500).json({
      error: 'Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.',
    });
  }
  
}
