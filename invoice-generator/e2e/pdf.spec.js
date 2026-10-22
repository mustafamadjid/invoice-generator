import { test, expect } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

test('generates and renders real receipt PDFs with local fonts', async ({ page }, testInfo) => {
  const errors = []
  const external = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => {
    if (/^https?:/.test(request.url()) && !request.url().startsWith(testInfo.project.use.baseURL)) {
      external.push(request.url())
    }
  })
  await page.goto('/e2e/fixtures/pdf.html')
  await page.waitForFunction(() => typeof window.renderReceipt === 'function')
  const sample = await page.evaluate(() => window.renderReceipt())
  expect(sample.pages).toBe(1)
  expect(sample.width).toBeCloseTo(226.77, 2)
  expect(sample.text).toContain('Rp 396.000')
  await writeFile(testInfo.outputPath('sample.pdf'), Buffer.from(sample.bytes))
  await page.locator('canvas').screenshot({ path: testInfo.outputPath('sample.png') })
  const receipt58mm = await page.evaluate(() => window.renderReceipt(2, '58mm'))
  await writeFile(testInfo.outputPath('sample-58mm.pdf'), Buffer.from(receipt58mm.bytes))
  await page.locator('canvas').screenshot({ path: testInfo.outputPath('sample-58mm.png') })
  expect(receipt58mm.pages).toBe(1)
  expect(receipt58mm.width).toBeCloseTo(58 * 72 / 25.4, 2)
  expect(receipt58mm.height).toBeCloseTo(168 * 72 / 25.4, 2)
  expect(receipt58mm.text).toContain('Terima kasih telah membeli')
  for (const count of [1, 2, 10, 50]) {
    const receipt = await page.evaluate((value) => window.renderReceipt(value), count)
    expect(receipt.pages).toBe(1)
    expect(receipt.text).toContain(`${count}.`)
    expect(receipt.text).toContain('Terima kasih')
    if (count === 50) {
      expect(receipt.height).toBeGreaterThan(sample.height)
      expect(receipt.text).toContain('Rp 9.989.999.001')
      expect(receipt.text).toContain('Rp 499.499.950.050')
      await writeFile(testInfo.outputPath('long.pdf'), Buffer.from(receipt.bytes))
      await page.locator('canvas').screenshot({ path: testInfo.outputPath('long.png') })
    }
  }
  expect(errors).toEqual([])
  expect(external).toEqual([])
})
