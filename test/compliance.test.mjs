import { expect, test } from "vitest"
import { readFile, readdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { verifyRepository } from "../scripts/lib/compliance-verify.mjs"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"))

test("the machine-readable conformance graph is internally valid", async () => {
  const report = await verifyRepository(root)
  expect(report.errors).toEqual([])
  expect(report.valid).toBe(true)
  expect(report.summary.components).toBe(49)
})

test("official package compatibility lag is explicit", async () => {
  const lock = await readJson("upstream/sources.lock.json")
  for (const id of ["dads-design-tokens", "dads-tailwind-theme"]) {
    const source = lock.sources.find((item) => item.id === id)
    expect(source.status).toBe("compatibility-lag")
    expect(source.compatibilityThrough).toMatch(/2\.14\.0/)
    expect(source.notes).toMatch(/2\.15|2\.16/)
  }
})

test("verified claims always carry review evidence", async () => {
  const directory = resolve(root, "compliance/requirements")
  const names = (await readdir(directory)).filter((name) => name.endsWith(".json"))
  const catalogs = await Promise.all(names.map((name) => readJson(`compliance/requirements/${name}`)))
  const verified = catalogs.flatMap((item) => item.requirements).filter((item) => item.status === "verified")
  for (const requirement of verified) {
    expect(requirement.evidence?.length).toBeGreaterThan(0)
    expect(requirement.tests?.length).toBeGreaterThan(0)
  }
})

test("governance documents reject official or blanket claims", async () => {
  const status = await readFile(resolve(root, "docs/conformance/status.md"), "utf8")
  const governance = await readFile(resolve(root, "docs/governance/upstream-policy.md"), "utf8")
  expect(status).toMatch(/適合認定ではありません/)
  expect(governance).toMatch(/独立した派生実装/)
  expect(governance).toMatch(/自動採用しません/)
})

test("the module exposes semantic, keyboard, and target-size contracts", async () => {
  const header = await readFile(resolve(root, "src/runtime/app/components/PageHeader.vue"), "utf8")
  const skip = await readFile(resolve(root, "src/runtime/app/components/SkipLink.vue"), "utf8")
  const css = await readFile(resolve(root, "src/runtime/app/assets/nuxtjp-ui.css"), "utf8")
  expect(skip).toMatch(/nuxtjp-skip-link/)
  expect(header).toMatch(/<UPageHeader/)
  expect(css).toMatch(/:focus-visible/)
  expect(css).toMatch(/min-block-size:\s*2\.75rem/)
})

test("generic metrics and transport states remain independently reusable", async () => {
  const metric = await readFile(resolve(root, "src/runtime/app/components/MetricGrid.vue"), "utf8")
  const states = await readFile(resolve(root, "src/runtime/core/presentation.ts"), "utf8")
  expect(metric).toMatch(/<dl class="grid/)
  expect(states).toContain("NuxtJpUiTransport")
  expect(states).toContain("NuxtJpUiReadState")
})
