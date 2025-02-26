import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import jwt from 'jsonwebtoken';
// testw

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  // Validação do e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de e-mail inválido.' });
  }

  // Validação da senha para permitir caracteres especiais
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,;:/?\s])[A-Za-z\d@$!%*?&.,;:/?\s]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.' });
  }

  try {
    // Autenticar usuário no Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Criar payload para o token JWT
    const payload = {
      uid: user.uid,
      email: user.email,
    };

    // Geração do token JWT com mais segurança
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("Erro: JWT_SECRET não está definido nas variáveis de ambiente.");
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '4h', algorithm: 'HS256' });

    return res.status(200).json({
      uid: user.uid,
      email: user.email,
      token,
      message: 'Login realizado com sucesso',
    });
  } catch (error: any) {
    // Tratamento de erro mais informativo
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
    }

    console.error(`Erro no login: ${error.message} - Email recebido: ${email}`);
    return res.status(500).json({ error: 'Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.' });
  }
}
