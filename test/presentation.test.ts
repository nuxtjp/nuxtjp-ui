import { describe, expect, it } from 'vitest'
import { nuxtJpUiReadState, nuxtJpUiTransport } from '../src/runtime/core'

describe('generic read-state presentation', () => {
  it.each([
    ['pending', {}, null, 'loading'],
    ['success', {}, null, 'ready'],
    ['success', null, null, 'error'],
    ['error', undefined, new Error('offline'), 'error']
  ])('maps transport without presenting missing data as empty', (status, data, error, expected) => {
    expect(nuxtJpUiTransport(status as string, data, error)).toBe(expected)
  })

  it('offers a pending-ready-error vocabulary for non-Nuxt consumers', () => {
    expect(nuxtJpUiReadState('pending', undefined, null)).toBe('pending')
    expect(nuxtJpUiReadState('success', {}, null)).toBe('ready')
  })
})
