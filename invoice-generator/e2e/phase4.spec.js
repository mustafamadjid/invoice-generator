import { createHash } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

async function extractPdfText(bytes) {
  const task = getDocument({ data: Uint8Array.from(bytes) })
  const document = await task.promise
  const page = await document.getPage(1)
  const content = await page.getTextContent()
  const text = content.items.map((item) => item.str).join(' ')
  await task.destroy()
  return text
}

test('previews the current PDF and downloads the exact same Blob with an updated render after edits', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.getByRole('button', { name: 'Isi Data Contoh' }).click()
  const frame = page.getByTitle('Preview struk PDF')
  await expect(frame).toBeVisible()
  await expect(frame).toHaveAttribute('src', /^blob:/)
  await expect(page.getByRole('button', { name: 'Download PDF' })).toBeEnabled()
  await page.screenshot({ path: testInfo.outputPath('preview.png'), fullPage: true })
  const previewUrl = await frame.getAttribute('src')
  const previewBytes = await page.evaluate(async (url) => {
    const response = await fetch(url)
    return Array.from(new Uint8Array(await response.arrayBuffer()))
  }, previewUrl)

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download PDF' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('struk-garchicks-kitchen-yuni-2026-10-19.pdf')
  const downloadStream = await download.createReadStream()
  const chunks = []
  for await (const chunk of downloadStream) chunks.push(chunk)
  const downloaded = Buffer.concat(chunks)
  expect(createHash('sha256').update(downloaded).digest('hex'))
    .toBe(createHash('sha256').update(Buffer.from(previewBytes)).digest('hex'))
  expect(await extractPdfText(previewBytes)).toContain('Yuni')

  const filename = 'struk-garchicks-kitchen-yuni-2026-10-19.pdf'
  const fallbackLink = page.getByRole('link', { name: 'Unduh struk PDF' })
  await expect(fallbackLink).toHaveAttribute('href', previewUrl)
  await expect(fallbackLink).toHaveAttribute('download', filename)
  expect((await fallbackLink.boundingBox()).height).toBeLessThan(24)
  const [fallbackDownload] = await Promise.all([
    page.waitForEvent('download'),
    fallbackLink.click(),
  ])
  expect(fallbackDownload.suggestedFilename()).toBe(filename)
  const fallbackStream = await fallbackDownload.createReadStream()
  const fallbackChunks = []
  for await (const chunk of fallbackStream) fallbackChunks.push(chunk)
  expect(createHash('sha256').update(Buffer.concat(fallbackChunks)).digest('hex'))
    .toBe(createHash('sha256').update(Buffer.from(previewBytes)).digest('hex'))

  await page.getByLabel('Pelanggan', { exact: true }).fill('Yuni Terbaru')
  await expect(frame).toHaveAttribute('src', /^blob:/, { timeout: 10000 })
  await expect(page.getByRole('button', { name: 'Download PDF' })).toBeEnabled()
  const latestUrl = await frame.getAttribute('src')
  expect(latestUrl).not.toBe(previewUrl)
  const latestBytes = await page.evaluate(async (url) => {
    const response = await fetch(url)
    return Array.from(new Uint8Array(await response.arrayBuffer()))
  }, latestUrl)
  expect(await extractPdfText(latestBytes)).toContain('Yuni Terbaru')
  await expect(page.getByRole('button', { name: 'Download PDF' })).toBeEnabled()
  const [updatedDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download PDF' }).click(),
  ])
  const updatedStream = await updatedDownload.createReadStream()
  const updatedChunks = []
  for await (const chunk of updatedStream) updatedChunks.push(chunk)
  expect(await extractPdfText(Buffer.concat(updatedChunks))).toContain('Yuni Terbaru')
  expect(errors).toEqual([])
})

test('shows a generic generation error and blocks download when the generator module fails', async ({ page }) => {
  await page.route('**/node_modules/.vite/deps/pdfmake_build_pdfmake.js*', async (route) => route.abort())
  await page.goto('/')
  await page.getByRole('button', { name: 'Isi Data Contoh' }).click()
  const alert = page.getByRole('alert')
  await expect(alert).toContainText(/Gagal membuat preview PDF/)
  await expect(alert).toContainText(/muat ulang halaman/i)
  await expect(alert).toContainText(/isian yang belum diunduh akan hilang/i)
  await expect(alert).not.toContainText(/Failed to fetch|dynamically imported module/i)
  await expect(page.getByRole('button', { name: 'Download PDF' })).toBeDisabled()
})
