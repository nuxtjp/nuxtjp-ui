import { expect, test, vi } from "vitest"
import { requestOfficialUpstream } from "../scripts/lib/upstream-http.mjs"

const pageProbe = {
  type: "contains-text",
  url: "https://design.digital.go.jp/dads/",
  expected: "v2.16.0"
}

test.each([
  "http://design.digital.go.jp/dads/",
  "https://user:secret@design.digital.go.jp/dads/",
  "https://design.digital.go.jp:8443/dads/",
  "https://design.digital.go.jp/dads/?target=internal",
  "https://127.0.0.1/dads/",
  "https://api.github.com/repos/another-owner/project/commits/main"
])("rejects a non-official probe before network access: %s", async (url) => {
  const fetchImpl = vi.fn()
  await expect(requestOfficialUpstream({ ...pageProbe, url }, { fetchImpl })).rejects.toThrow(/rejected/)
  expect(fetchImpl).not.toHaveBeenCalled()
})

test("validates every redirect target against the same allow-list", async () => {
  const fetchImpl = vi.fn(async () => new Response(null, {
    status: 302,
    headers: { location: "http://127.0.0.1/private" }
  }))
  await expect(requestOfficialUpstream(pageProbe, { fetchImpl })).rejects.toThrow(/HTTPS is required/)
  expect(fetchImpl).toHaveBeenCalledTimes(1)
})

test("rejects oversized declared and streamed responses", async () => {
  const declared = async () => new Response("small", { headers: { "content-length": "11" } })
  await expect(requestOfficialUpstream(pageProbe, { fetchImpl: declared, maxBytes: 10 }))
    .rejects.toThrow(/size limit/)
  const streamed = async () => new Response("12345678901")
  await expect(requestOfficialUpstream(pageProbe, { fetchImpl: streamed, maxBytes: 10 }))
    .rejects.toThrow(/size limit/)
})

test("applies a bounded timeout to the complete request", async () => {
  const fetchImpl = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true })
  })
  await expect(requestOfficialUpstream(pageProbe, { fetchImpl, timeoutMs: 5 }))
    .rejects.toThrow()
})

test("accepts a bounded official response", async () => {
  const fetchImpl = async () => new Response("DADS v2.16.0")
  await expect(requestOfficialUpstream(pageProbe, { fetchImpl, maxBytes: 100 }))
    .resolves.toBe("DADS v2.16.0")
})
