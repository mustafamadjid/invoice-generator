import { useEffect, useRef, useState } from 'react'
import { createReceiptBlob } from '../lib/receiptPdf.js'

export const PREVIEW_DEBOUNCE_MS = 250

export function usePdfPreview(invoice, isValid) {
  const [preview, setPreview] = useState({ key: null, url: null, status: 'idle', error: '' })
  const generationRef = useRef(0)
  const activeUrlRef = useRef(null)
  const key = invoice

  useEffect(() => {
    const generation = ++generationRef.current
    const releaseUrl = () => {
      if (activeUrlRef.current) URL.revokeObjectURL(activeUrlRef.current)
      activeUrlRef.current = null
    }

    if (!isValid) {
      return () => {
        if (generationRef.current === generation) generationRef.current += 1
        releaseUrl()
      }
    }

    const timer = window.setTimeout(async () => {
      try {
        const blob = await createReceiptBlob(invoice)
        if (generationRef.current !== generation) return

        const url = URL.createObjectURL(blob)
        releaseUrl()
        activeUrlRef.current = url
        setPreview({ key, url, status: 'ready', error: '' })
      } catch (error) {
        if (generationRef.current !== generation) return
        releaseUrl()
        setPreview({
          key, url: null, status: 'error',
          error: error instanceof Error ? error.message : 'Kesalahan tidak diketahui',
        })
      }
    }, PREVIEW_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      if (generationRef.current === generation) generationRef.current += 1
      releaseUrl()
    }
  }, [invoice, isValid, key])

  if (!isValid) return { key, url: null, status: 'invalid', error: '' }
  if (preview.key !== key) return { key, url: null, status: 'loading', error: '' }
  return preview
}
