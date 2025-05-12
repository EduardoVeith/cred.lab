import admin from 'firebase-admin'

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID!
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!
  const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Credenciais do Firebase Admin não estão definidas corretamente no .env')
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  })
}


export const firestore = admin.firestore()
export default admin
