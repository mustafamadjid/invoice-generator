import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerUrl

const CSS_PIXELS_PER_POINT = 96 / 72

export async function renderReceiptPreview(url, canvas) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('PDF preview could not be loaded')

  const data = new Uint8Array(await response.arrayBuffer())
  const loadingTask = getDocument({ data })

  try {
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const outputScale = Math.max(1, window.devicePixelRatio || 1)
    const viewport = page.getViewport({ scale: CSS_PIXELS_PER_POINT * outputScale })
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is unavailable')

    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: context, viewport }).promise
  } finally {
    await loadingTask.destroy()
  }
}
