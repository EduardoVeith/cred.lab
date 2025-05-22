import { useEffect, useRef } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

interface QrScannerProps {
  onResult: (text: string) => void
  onError?: (err: any) => void
}

const QrScanner: React.FC<QrScannerProps> = ({ onResult, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    let active = true

    // Função que inicia o scanner
    const startScanner = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        onError?.(new Error('API de câmera não suportada neste navegador'))
        return
      }

      try {
        // esse await faz com que erros de permissão caiam no catch
        await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, err) => {
            if (!active) return

            if (result) {
              onResult(result.getText())

              // para a câmera
              const stream = videoRef.current?.srcObject as MediaStream | null
              stream?.getTracks().forEach((t) => t.stop())
              active = false
            }

            // erros de “não encontrado” são normais até achar algo
            if (err && err.name !== 'NotFoundException') {
              onError?.(err)
            }
          }
        )
      } catch (e) {
        onError?.(e)
      }
    }

    startScanner()

    return () => {
      active = false
      const stream = videoRef.current?.srcObject as MediaStream | null
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [onResult, onError])

  return <video ref={videoRef} style={{ width: '100%' }} />
}

export default QrScanner
