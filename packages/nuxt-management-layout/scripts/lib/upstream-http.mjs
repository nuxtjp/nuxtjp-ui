const allowedHosts = new Set([
  'design.digital.go.jp', 'nuxt.com', 'ui.nuxt.com', 'www.digital.go.jp'
])
const redirects = new Set([301, 302, 303, 307, 308])

export function assertUpstreamUrl(value) {
  const url = new URL(value)
  if (url.protocol !== 'https:') throw new Error('upstream URL rejected: HTTPS is required')
  if (url.username || url.password || url.port) throw new Error('upstream URL rejected: authority')
  if (url.search || url.hash) throw new Error('upstream URL rejected: query or fragment')
  if (!allowedHosts.has(url.hostname)) throw new Error('upstream URL rejected: host')
  return url
}

export async function requestOfficialPage(probe, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch
  const maximumBytes = options.maximumBytes ?? 1_048_576
  const timeoutMs = options.timeoutMs ?? 15_000
  const maximumRedirects = options.maximumRedirects ?? 3
  let url = assertUpstreamUrl(probe.url)
  const signal = AbortSignal.timeout(timeoutMs)
  for (let count = 0; count <= maximumRedirects; count += 1) {
    const response = await fetchImpl(url, {
      headers: { 'user-agent': 'nuxtjp-management-layout-upstream-check' },
      redirect: 'manual', signal
    })
    if (redirects.has(response.status)) {
      if (count === maximumRedirects) throw new Error('upstream redirect limit exceeded')
      const location = response.headers.get('location')
      if (!location) throw new Error('upstream redirect is missing location')
      url = assertUpstreamUrl(new URL(location, url).href)
      continue
    }
    if (!response.ok) throw new Error(`upstream HTTP ${response.status}`)
    return readBoundedText(response, maximumBytes)
  }
  throw new Error('upstream redirect limit exceeded')
}

async function readBoundedText(response, maximumBytes) {
  const declared = Number(response.headers.get('content-length') ?? 0)
  if (declared > maximumBytes) throw new Error('upstream response exceeds size limit')
  if (!response.body) return ''
  const reader = response.body.getReader()
  const chunks = []
  let received = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    received += value.byteLength
    if (received > maximumBytes) {
      await reader.cancel()
      throw new Error('upstream response exceeds size limit')
    }
    chunks.push(value)
  }
  const combined = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(combined)
}
