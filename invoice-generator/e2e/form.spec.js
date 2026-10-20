import { test, expect } from '@playwright/test'

test('reference transaction, validation, reset, and session-only state', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.getByRole('button', { name: 'Isi Data Contoh' }).click()
  const summary = page.getByRole('region', { name: 'Ringkasan transaksi' })
  await expect(summary.getByText('Rp 396.000', { exact: true })).toHaveCount(2)
  await expect(page.getByLabel('Tanggal', { exact: true })).toHaveValue('2026-10-19')
  await expect(page.locator('.preview-status-ready')).toHaveText('Siap diunduh')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('form.png'), fullPage: true })

  const price = page.getByLabel('Harga satuan produk 1', { exact: true })
  await price.fill('')
  await price.press('Tab')
  await expect(page.getByText('Harga satuan wajib diisi', { exact: true })).toBeVisible()
  await expect(summary.getByText('—', { exact: true })).toHaveCount(3)
  await price.fill('0')
  await expect(summary.getByText('Rp 44.000', { exact: true })).toHaveCount(2)
  await page.getByRole('button', { name: 'Tambah Produk', exact: true }).click()
  await expect(page.getByLabel('Nama produk 3', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Hapus produk 3', exact: true }).click()
  await expect(summary.getByText('Rp 44.000', { exact: true })).toHaveCount(2)

  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('button', { name: 'Reset Form' }).click()
  await expect(page.getByLabel('Pelanggan', { exact: true })).toHaveValue('Yuni')
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Reset Form' }).click()
  await expect(page.getByLabel('Pelanggan', { exact: true })).toHaveValue('')
  await expect(page.getByRole('button', { name: 'Hapus produk 1', exact: true })).toBeDisabled()
  await page.getByLabel('Pelanggan', { exact: true }).fill('Draft')
  await page.reload()
  await expect(page.getByLabel('Pelanggan', { exact: true })).toHaveValue('')
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0)
  expect(errors).toEqual([])
})

test('keeps the workspace usable from narrow phones through desktop widths without storage or API calls', async ({ page }, testInfo) => {
  const origin = new URL(testInfo.project.use.baseURL).origin
  const externalRequests = []
  const apiRequests = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (['http:', 'https:'].includes(url.protocol) && url.origin !== origin) externalRequests.push(request.url())
    if (['fetch', 'xhr'].includes(request.resourceType())) apiRequests.push(request.url())
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Isi Data Contoh' }).click()
  await expect(page.locator('.preview-status-ready')).toHaveText('Siap diunduh')
  const form = page.locator('.workspace > form')
  const aside = page.locator('.workspace > aside')
  for (const width of [320, 390, 600, 601, 768, 1000, 1001, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `horizontal overflow at ${width}px`)
      .toBe(true)
    await expect(page.getByRole('button', { name: 'Tambah Produk', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Download PDF', exact: true })).toBeVisible()

    const formBox = await form.boundingBox()
    const asideBox = await aside.boundingBox()
    if (width <= 1000) {
      expect(asideBox.y, `preview should stack below the form at ${width}px`)
        .toBeGreaterThanOrEqual(formBox.y + formBox.height)
    } else {
      expect(Math.abs(asideBox.y - formBox.y), `preview should align beside the form at ${width}px`)
        .toBeLessThan(1)
    }
  }

  const storage = await page.evaluate(async () => ({
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length,
    cookies: document.cookie,
    indexedDB: await indexedDB.databases(),
  }))
  expect(storage).toEqual({ localStorage: 0, sessionStorage: 0, cookies: '', indexedDB: [] })
  expect(externalRequests).toEqual([])
  expect(apiRequests).toEqual([])
})
