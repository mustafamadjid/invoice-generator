import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createSampleInvoice } from '../data/sampleInvoice.js'
import { usePdfPreview } from '../hooks/usePdfPreview.js'
import { createReceiptBlob } from './receiptPdf.js'

vi.mock('./receiptPdf.js', () => ({ createReceiptBlob: vi.fn() }))

function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

let createUrl
let revokeUrl

beforeEach(() => {
  vi.useFakeTimers()
  createUrl = vi.fn(() => `blob:receipt-${Math.random()}`)
  revokeUrl = vi.fn()
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: revokeUrl }))
  vi.mocked(createReceiptBlob).mockReset()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('debounces valid edits and ignores an older PDF that finishes after the latest one', async () => {
  const oldRender = deferred()
  const newRender = deferred()
  vi.mocked(createReceiptBlob).mockReturnValueOnce(oldRender.promise).mockReturnValueOnce(newRender.promise)
  const first = createSampleInvoice()
  const { result, rerender } = renderHook(({ invoice }) => usePdfPreview(invoice, true), { initialProps: { invoice: first } })

  await act(async () => { vi.advanceTimersByTime(249) })
  expect(createReceiptBlob).not.toHaveBeenCalled()
  await act(async () => { vi.advanceTimersByTime(1) })
  expect(createReceiptBlob).toHaveBeenCalledTimes(1)

  const latest = { ...first, transaction: { ...first.transaction, customer: 'Yuni Baru' } }
  rerender({ invoice: latest })
  await act(async () => { vi.advanceTimersByTime(250) })
  expect(createReceiptBlob).toHaveBeenCalledTimes(2)

  await act(async () => { newRender.resolve(new Blob(['latest'], { type: 'application/pdf' })) })
  expect(result.current.status).toBe('ready')
  const freshUrl = result.current.url
  await act(async () => { oldRender.resolve(new Blob(['stale'], { type: 'application/pdf' })) })
  expect(result.current.url).toBe(freshUrl)
  expect(result.current.key).toEqual({ invoice: latest, paperSize: '80mm' })
  expect(createUrl).toHaveBeenCalledTimes(1)
})

it('revokes the visible URL when data becomes invalid and releases the last URL on unmount', async () => {
  vi.mocked(createReceiptBlob).mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
  const invoice = createSampleInvoice()
  const { result, rerender, unmount } = renderHook(({ currentInvoice, valid }) => usePdfPreview(currentInvoice, valid), {
    initialProps: { currentInvoice: invoice, valid: true },
  })
  await act(async () => { vi.advanceTimersByTime(250) })
  expect(result.current.status).toBe('ready')
  const url = result.current.url
  rerender({ currentInvoice: { ...invoice, items: [{ ...invoice.items[0], unitPrice: '' }] }, valid: false })
  expect(result.current.status).toBe('invalid')
  expect(result.current.url).toBeNull()
  expect(revokeUrl).toHaveBeenCalledWith(url)

  rerender({ currentInvoice: invoice, valid: true })
  await act(async () => { vi.advanceTimersByTime(250) })
  const finalUrl = result.current.url
  unmount()
  expect(revokeUrl).toHaveBeenCalledWith(finalUrl)
})

it('does not expose a revoked Blob URL when data returns to the same values before debounce', async () => {
  vi.mocked(createReceiptBlob).mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
  const initial = createSampleInvoice()
  const { result, rerender } = renderHook(({ invoice }) => usePdfPreview(invoice, true), {
    initialProps: { invoice: initial },
  })
  await act(async () => { vi.advanceTimersByTime(250) })
  const firstUrl = result.current.url
  expect(result.current.status).toBe('ready')

  rerender({ invoice: { ...initial, transaction: { ...initial.transaction, customer: 'Temporary' } } })
  expect(result.current.status).toBe('loading')
  rerender({ invoice: { ...initial, store: { ...initial.store } } })
  expect(result.current.status).toBe('loading')
  expect(result.current.url).toBeNull()
  expect(revokeUrl).toHaveBeenCalledWith(firstUrl)
})

it('exposes the generation failure for the preview UI without reviving an old URL', async () => {
  vi.mocked(createReceiptBlob).mockRejectedValue(new Error('PDF gagal dibuat'))
  const invoice = createSampleInvoice()
  const { result } = renderHook(() => usePdfPreview(invoice, true))
  await act(async () => { vi.advanceTimersByTime(250) })
  expect(result.current.status).toBe('error')
  expect(result.current.error).toBe('PDF gagal dibuat')
  expect(result.current.url).toBeNull()
})


