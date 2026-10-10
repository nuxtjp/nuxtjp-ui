import { describe, expect, it, vi } from 'vitest'
import { requestOfficialPage } from '../scripts/lib/upstream-http.mjs'

const probe = {
  type: 'contains-text',
  url: 'https://nuxt.com/docs/4.x/getting-started/layers',
  expected: 'Layers'
}

describe('bounded primary-source access', () => {
  it.each([
    'http://nuxt.com/docs/4.x/getting-started/layers',
    'https://user:secret@nuxt.com/docs/4.x/getting-started/layers',
    'https://nuxt.com:8443/docs/4.x/getting-started/layers',
    'https://nuxt.com/docs/4.x/getting-started/layers?target=internal',
    'https://127.0.0.1/private'
  ])('rejects an unsafe URL before network access: %s', async url => {
    const fetchImpl = vi.fn()
    await expect(requestOfficialPage({ ...probe, url }, { fetchImpl })).rejects.toThrow(/rejected/u)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('checks every redirect target against the same allow-list', async () => {
    const fetchImpl = vi.fn(async () => new Response(null, {
      status: 302, headers: { location: 'http://127.0.0.1/private' }
    }))
    await expect(requestOfficialPage(probe, { fetchImpl })).rejects.toThrow(/HTTPS/u)
  })

  it('rejects declared and streamed oversized responses', async () => {
    const declared = async () => new Response('small', { headers: { 'content-length': '11' } })
    await expect(requestOfficialPage(probe, { fetchImpl: declared, maximumBytes: 10 }))
      .rejects.toThrow(/size limit/u)
    const streamed = async () => new Response('12345678901')
    await expect(requestOfficialPage(probe, { fetchImpl: streamed, maximumBytes: 10 }))
      .rejects.toThrow(/size limit/u)
  })

  it('accepts a bounded response from an allowed host', async () => {
    const fetchImpl = async () => new Response('Nuxt Layers')
    await expect(requestOfficialPage(probe, { fetchImpl, maximumBytes: 100 }))
      .resolves.toBe('Nuxt Layers')
  })
})
