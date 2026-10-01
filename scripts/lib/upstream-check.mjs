import { assertUpstreamUrl, requestOfficialUpstream } from "./upstream-http.mjs"

const probeTypes = new Set(["contains-text", "github-head", "github-release"])

function validateProbe(probe) {
  if (!probeTypes.has(probe?.type)) throw new Error("upstream probe rejected: invalid type")
  if (typeof probe.expected !== "string" || !probe.expected || probe.expected.length > 256) {
    throw new Error("upstream probe rejected: invalid expected value")
  }
  return assertUpstreamUrl(probe.url, probe.type).href
}

function observedValue(probe, payload) {
  if (probe.type === "contains-text") {
    const text = typeof payload === "string" ? payload : JSON.stringify(payload)
    const matches = text.includes(probe.expected)
    return { matches, actual: matches ? "marker-present" : "marker-absent" }
  }
  const key = probe.type === "github-release" ? "tag_name" : "sha"
  const value = payload?.[key]
  const actual = typeof value === "string" && value.length <= 256 ? value : null
  return { matches: actual === probe.expected, actual }
}

export async function checkSources(lock, options = {}) {
  const request = options.request ?? ((probe) => requestOfficialUpstream(probe, options))
  const results = []
  for (const source of lock.sources ?? []) {
    for (const probe of source.probes ?? []) {
      let reportUrl = "[rejected-upstream-url]"
      try {
        reportUrl = validateProbe(probe)
        const safeProbe = { ...probe, url: reportUrl }
        const payload = await request(safeProbe)
        const observation = observedValue(safeProbe, payload)
        results.push({
          sourceId: source.id,
          type: probe.type,
          url: reportUrl,
          expected: probe.expected,
          actual: observation.actual,
          result: observation.matches ? "match" : "mismatch",
          disposition: observation.matches ? "none" : "review-required"
        })
      } catch (error) {
        results.push({
          sourceId: source.id,
          type: probe.type,
          url: reportUrl,
          expected: probe.expected,
          actual: null,
          result: "unavailable",
          disposition: "review-required",
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
  }
  const counts = results.reduce((value, item) => {
    value[item.result] += 1
    return value
  }, { match: 0, mismatch: 0, unavailable: 0 })
  return {
    checkedAt: new Date().toISOString(),
    policy: lock.reviewPolicy,
    counts,
    results
  }
}

export function exitCodeFor(report) {
  if (report.counts.unavailable > 0) return 1
  if (report.counts.mismatch > 0) return 2
  return 0
}
