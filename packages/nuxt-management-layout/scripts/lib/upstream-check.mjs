import { assertUpstreamUrl, requestOfficialPage } from './upstream-http.mjs'

function validateProbe(probe) {
  if (probe?.type !== 'contains-text') throw new Error('invalid upstream probe type')
  if (typeof probe.expected !== 'string' || !probe.expected || probe.expected.length > 256) {
    throw new Error('invalid upstream marker')
  }
  return assertUpstreamUrl(probe.url).href
}

export async function checkSources(lock, options = {}) {
  const request = options.request ?? (probe => requestOfficialPage(probe, options))
  const results = []
  for (const source of lock.sources ?? []) {
    for (const probe of source.probes ?? []) {
      let url = '[rejected-upstream-url]'
      try {
        url = validateProbe(probe)
        const text = await request({ ...probe, url })
        const matches = typeof text === 'string' && text.includes(probe.expected)
        results.push({
          sourceId: source.id, url, expected: probe.expected,
          actual: matches ? 'marker-present' : 'marker-absent',
          result: matches ? 'match' : 'mismatch',
          disposition: matches ? 'none' : 'review-required'
        })
      } catch (error) {
        results.push({
          sourceId: source.id, url, expected: probe.expected, actual: null,
          result: 'unavailable', disposition: 'review-required',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
  }
  const counts = results.reduce((value, item) => {
    value[item.result] += 1
    return value
  }, { match: 0, mismatch: 0, unavailable: 0 })
  return { checkedAt: new Date().toISOString(), policy: lock.reviewPolicy, counts, results }
}

export function exitCodeFor(report) {
  if (report.counts.unavailable > 0) return 1
  if (report.counts.mismatch > 0) return 2
  return 0
}
