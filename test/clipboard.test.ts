import { describe, expect, it, vi } from 'vitest'
import { attemptNuxtJpClipboardCopy } from '../src/runtime/core'

describe('clipboard fallback', () => {
  it('reports copied only after the platform accepts the value', async () => {
    const writeText = vi.fn(async () => undefined)
    await expect(attemptNuxtJpClipboardCopy('value', { writeText })).resolves.toBe('copied')
    expect(writeText).toHaveBeenCalledWith('value')
  })

  it('falls back to manual copy when unavailable or rejected', async () => {
    await expect(attemptNuxtJpClipboardCopy('value')).resolves.toBe('manual')
    await expect(attemptNuxtJpClipboardCopy('value', {
      writeText: async () => { throw new Error('denied') }
    })).resolves.toBe('manual')
  })
})
