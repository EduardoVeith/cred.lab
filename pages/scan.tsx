import React, { useState, useCallback } from 'react'
import Head from 'next/head'
import QrScanner from '../components/tickets/QrScanner'
import styles from './scan.module.css'
import AuthGuard from '../components/Auth/AuthGuard';

interface VerifyResponse {
  valid: boolean
  reason?: string
  userId?: string
  eventId?: string
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(true)
  const [ticketId, setTicketId] = useState<string>()
  const [result, setResult] = useState<VerifyResponse>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  const handleResult = useCallback((data: string) => {
    setScanning(false)
    setTicketId(data)
    verifyTicket(data)
  }, [])

  const handleError = useCallback((err: any) => {
    console.error(err)
    setError('Não foi possível acessar a câmera')
    setScanning(false)
  }, [])

  async function verifyTicket(id: string) {
    setLoading(true)
    setError(undefined)
    setResult(undefined)

    try {
      const res = await fetch('/api/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: id }),
      })
      const body = (await res.json()) as VerifyResponse

      if (!res.ok) {
        // usa sempre body.reason para erros
        setError(body.reason || 'Resposta inesperada do servidor')
      } else {
        setResult(body)
      }
    } catch (e) {
      console.error(e)
      setError('Erro de rede ao verificar ingresso')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setScanning(true)
    setTicketId(undefined)
    setResult(undefined)
    setError(undefined)
    setLoading(false)
  }

  return (
    <>
     <AuthGuard>
      <Head>
        <title>Verificar Ingresso</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className={styles.header}>
        <h1 className={styles.logo}>TANC</h1>
      </header>

      <main className={styles.container}>
        <h2 className={styles.pageTitle}>Verificar Ingresso</h2>

        {scanning && !error && !result && (
          <div className={styles.qrContainer}>
            <QrScanner onResult={handleResult} onError={handleError} />
            <p className={styles.helpText}>
              Aponte a câmera para o QR Code do ingresso
            </p>
          </div>
        )}

        {loading && (
          <p className={styles.result}>Aguarde, validando…</p>
        )}

        {error && (
          <div className={`${styles.result} ${styles.failure}`}>
            {error}
          </div>
        )}

        {result && (
          <div className={styles.result}>
            {result.valid ? (
              <p className={styles.success}>
                Ingresso válido! 🎉
              </p>
            ) : (
              <p className={styles.failure}>
                Ingresso inválido: {result.reason}
              </p>
            )}
          </div>
        )}

        {(!scanning || result || error) && (
          <button
            className={styles.buttonReset}
            onClick={reset}
            disabled={loading}
          >
            Escanear outro
          </button>
        )}
      </main>
      </AuthGuard>
    </>
  )
}
