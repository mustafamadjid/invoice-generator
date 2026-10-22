import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import ReceiptPreview from './ReceiptPreview.jsx'

vi.mock('../lib/renderReceiptPreview.js', () => ({
  renderReceiptPreview: vi.fn().mockResolvedValue(undefined),
}))

function renderPreview(paperSize = '58mm', url = 'blob:receipt') {
  return render(
    <ReceiptPreview
      preview={{ status: 'ready', url }}
      filename="struk.pdf"
      paperSize={paperSize}
      onPaperSizeChange={vi.fn()}
      onDownload={vi.fn()}
      downloading={false}
    />,
  )
}

it.each(['58mm', '80mm'])('shows the %s paper width and waits for the PDF before enabling print', async (paperSize) => {
  renderPreview(paperSize)

  const paper = screen.getByRole('img', { name: 'Preview struk PDF' }).parentElement
  const frame = screen.getByTitle('PDF untuk dicetak')
  const printButton = screen.getByRole('button', { name: 'Cetak Struk' })
  expect(paper.style.getPropertyValue('--receipt-paper-width')).toBe(paperSize)
  expect(printButton.disabled).toBe(true)

  const printWindow = { focus: vi.fn(), print: vi.fn() }
  Object.defineProperty(frame, 'contentWindow', { configurable: true, value: printWindow })
  fireEvent.load(frame)

  expect(printButton.disabled).toBe(true)
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Siap dicetak'))
  expect(printButton.disabled).toBe(false)
  fireEvent.click(printButton)
  expect(printWindow.focus).toHaveBeenCalledOnce()
  expect(printWindow.print).toHaveBeenCalledOnce()
})

it('waits for the new PDF to load after the receipt changes', async () => {
  const view = renderPreview()
  const oldFrame = screen.getByTitle('PDF untuk dicetak')
  fireEvent.load(oldFrame)
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Siap dicetak'))
  expect(screen.getByRole('button', { name: 'Cetak Struk' }).disabled).toBe(false)

  view.rerender(
    <ReceiptPreview
      preview={{ status: 'ready', url: 'blob:receipt-updated' }}
      filename="struk.pdf"
      paperSize="58mm"
      onPaperSizeChange={vi.fn()}
      onDownload={vi.fn()}
      downloading={false}
    />,
  )

  expect(screen.getByRole('button', { name: 'Cetak Struk' }).disabled).toBe(true)
})
