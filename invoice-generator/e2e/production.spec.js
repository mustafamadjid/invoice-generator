import { createHash } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

test('serves the production app and downloads the PDF without API calls or browser storage', async ({ page }, testInfo) => {
  const origin = new URL(testInfo.project.use.baseURL).origin
  const externalRequests = []
  const apiRequests = []
  const pageErrors = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    const isHttp = ['http:', 'https:'].includes(url.protocol)
    if (isHttp && url.origin !== origin) externalRequests.push(request.url())
    if (isHttp && ['fetch', 'xhr'].includes(request.resourceType())) apiRequests.push(request.url())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Invoice Generator' })).toBeVisible()
  await page.getByRole('button', { name: 'Isi Data Contoh' }).click()
  const frame = page.locator('iframe[title="Preview struk PDF"]')
  await expect(frame).toBeVisible()
  await expect(frame).toHaveAttribute('src', /^blob:/)
  await expect(page.getByRole('button', { name: 'Download PDF' })).toBeEnabled()
  const previewUrl = await frame.getAttribute('src')
  const previewBytes = await page.evaluate(async (url) => {
    const response = await fetch(url)
    return Array.from(new Uint8Array(await response.arrayBuffer()))
  }, previewUrl)
  await expect(page.getByRole('link', { name: 'Unduh struk PDF' })).toHaveAttribute('href', previewUrl)

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download PDF' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('struk-garchicks-kitchen-yuni-2026-10-19.pdf')
  const stream = await download.createReadStream()
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  const bytes = Buffer.concat(chunks)
  expect(bytes.subarray(0, 4).toString()).toBe('%PDF')
  expect(bytes.subarray(-6).toString()).toContain('%%EOF')
  expect(createHash('sha256').update(bytes).digest('hex'))
    .toBe(createHash('sha256').update(Buffer.from(previewBytes)).digest('hex'))

  const task = getDocument({ data: Uint8Array.from(bytes) })
  const pdf = await task.promise
  expect(pdf.numPages).toBe(1)
  const firstPage = await pdf.getPage(1)
  expect(firstPage.view[2] - firstPage.view[0]).toBeCloseTo(226.77, 2)
  const content = await firstPage.getTextContent()
  const text = content.items.map((item) => item.str).join(' ')
  expect(text).toContain('Yuni')
  expect(text).toContain('Rp 396.000')
  expect(text).toContain('Terima kasih telah membeli makanan kami!')
  await task.destroy()

  const storage = await page.evaluate(async () => ({
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length,
    cookies: document.cookie,
    indexedDB: await indexedDB.databases(),
  }))
  expect(storage).toEqual({ localStorage: 0, sessionStorage: 0, cookies: '', indexedDB: [] })
  expect(externalRequests).toEqual([])
  expect(apiRequests).toEqual([])
  expect(pageErrors).toEqual([])
})
