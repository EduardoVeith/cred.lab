import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verifica se a requisição tem um token no cabeçalho
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1]; // Remove "Bearer " do token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return res.status(200).json({ message: "Token válido!", user: decoded });
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
