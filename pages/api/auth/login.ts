import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verifica se o método HTTP é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, password } = req.body;

  // Verifica se os campos obrigatórios foram preenchidos
  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  // Validação básica do formato de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de e-mail inválido.' });
  }

  try {
    // Autentica o usuário usando Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Cria um payload com os dados do usuário que serão incorporados no token
    const payload = {
      uid: user.uid,
      email: user.email,
    };

    // Gera o token JWT usando a chave secreta definida em variáveis de ambiente
    // e define um tempo de expiração (ex: 1 hora)
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '4h' });

    return res.status(200).json({
      uid: user.uid,
      email: user.email,
      token,
      message: 'Login realizado com sucesso'
    });
  } catch (error: any) {
    // Tratamento específico para erros de autenticação
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
    }
    
    // Para outros erros, retorna erro interno e registra o erro no console
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.' });
  }
}
