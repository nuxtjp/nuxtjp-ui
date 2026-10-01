import { expect, test } from "vitest"
import { checkSources, exitCodeFor } from "../scripts/lib/upstream-check.mjs"

function lockWith(probes) {
  return {
    reviewPolicy: "review-required",
    sources: [{ id: "primary-source", probes }]
  }
}

const pageUrl = "https://design.digital.go.jp/dads/"
const releaseUrl = "https://api.github.com/repos/digital-go-jp/design-tokens/releases/latest"
const headUrl = "https://api.github.com/repos/digital-go-jp/design-tokens/commits/develop"

test("matching primary-source probes require no review", async () => {
  const lock = lockWith([
    { type: "contains-text", url: pageUrl, expected: "v2.16.0" },
    { type: "github-release", url: releaseUrl, expected: "v2.0.1" },
    { type: "github-head", url: headUrl, expected: "abc123" }
  ])
  const payloads = new Map([
    [pageUrl, "current v2.16.0"],
    [releaseUrl, { tag_name: "v2.0.1" }],
    [headUrl, { sha: "abc123" }]
  ])
  const report = await checkSources(lock, { request: (probe) => payloads.get(probe.url) })
  expect(report.counts).toEqual({ match: 3, mismatch: 0, unavailable: 0 })
  expect(exitCodeFor(report)).toBe(0)
})

test("a changed upstream is reported but never adopted", async () => {
  const lock = lockWith([
    { type: "github-head", url: headUrl, expected: "reviewed-sha" }
  ])
  const report = await checkSources(lock, { request: async () => ({ sha: "new-sha" }) })
  expect(report.results[0].result).toBe("mismatch")
  expect(report.results[0].disposition).toBe("review-required")
  expect(report.results[0].expected).toBe("reviewed-sha")
  expect(exitCodeFor(report)).toBe(2)
})

test("an unavailable source fails closed for review", async () => {
  const lock = lockWith([
    { type: "contains-text", url: pageUrl, expected: "marker" }
  ])
  const report = await checkSources(lock, {
    request: async () => { throw new Error("offline") }
  })
  expect(report.results[0].result).toBe("unavailable")
  expect(report.results[0].disposition).toBe("review-required")
  expect(exitCodeFor(report)).toBe(1)
})

test("text probes report presence without echoing the expected marker", async () => {
  const lock = lockWith([{ type: "contains-text", url: pageUrl, expected: "marker" }])
  const report = await checkSources(lock, { request: async () => "marker" })
  expect(report.results[0].actual).toBe("marker-present")
})
