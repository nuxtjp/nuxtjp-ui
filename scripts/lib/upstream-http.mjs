const DEFAULT_MAX_BYTES = 2 * 1024 * 1024
const DEFAULT_TIMEOUT_MS = 15_000
const MAX_REDIRECTS = 3

const policies = new Map([
  ["design.digital.go.jp", {
    types: new Set(["contains-text"]),
    path: /^\/dads(?:\/|$)/
  }],
  ["www.digital.go.jp", {
    types: new Set(["contains-text"]),
    path: /^\/resources\/dashboard-guidebook(?:\/|$)/
  }],
  ["api.github.com", {
    types: new Set(["github-head", "github-release"]),
    path: /^\/repos\/digital-go-jp\/[A-Za-z0-9_.-]+\/(?:releases\/latest|commits\/(?:main|develop))$/
  }]
])

export function assertUpstreamUrl(rawUrl, probeType) {
  let url
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error("upstream URL rejected: invalid URL")
  }
  const policy = policies.get(url.hostname)
  if (url.protocol !== "https:") throw new Error("upstream URL rejected: HTTPS is required")
  if (url.username || url.password) throw new Error("upstream URL rejected: credentials are forbidden")
  if (url.port) throw new Error("upstream URL rejected: explicit ports are forbidden")
  if (url.search || url.hash) throw new Error("upstream URL rejected: query and fragment are forbidden")
  if (!policy?.types.has(probeType) || !policy.path.test(url.pathname)) {
    throw new Error("upstream URL rejected: source is outside the official allow-list")
  }
  return url
}

async function readBoundedText(response, maxBytes) {
  const length = response.headers.get("content-length")
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes)) {
    throw new Error("upstream response exceeds the size limit")
  }
  if (!response.body) return ""
  const reader = response.body.getReader()
  const decoder = new TextDecoder("utf-8", { fatal: true })
  let size = 0
  let text = ""
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) throw new Error("upstream response exceeds the size limit")
      text += decoder.decode(value, { stream: true })
    }
    return text + decoder.decode()
  } catch (error) {
    await reader.cancel().catch(() => {})
    throw error
  } finally {
    reader.releaseLock()
  }
}

function isRedirect(status) {
  return [301, 302, 303, 307, 308].includes(status)
}

export async function requestOfficialUpstream(probe, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
  const signal = AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  const headers = { "user-agent": "nuxtjp-ui-upstream-check" }
  if (probe.type !== "contains-text") headers.accept = "application/vnd.github+json"
  let url = assertUpstreamUrl(probe.url, probe.type)
  for (let redirects = 0; ; redirects += 1) {
    const response = await fetchImpl(url, { headers, redirect: "manual", signal })
    if (isRedirect(response.status)) {
      if (redirects >= MAX_REDIRECTS) throw new Error("upstream redirect limit exceeded")
      const location = response.headers.get("location")
      if (!location) throw new Error("upstream redirect is missing a location")
      await response.body?.cancel()
      url = assertUpstreamUrl(new URL(location, url).href, probe.type)
      continue
    }
    if (!response.ok) throw new Error(`upstream HTTP ${response.status}`)
    const text = await readBoundedText(response, maxBytes)
    if (probe.type === "contains-text") return text
    try {
      return JSON.parse(text)
    } catch {
      throw new Error("upstream response is not valid JSON")
    }
  }
}
