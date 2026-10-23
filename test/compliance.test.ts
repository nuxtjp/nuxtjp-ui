import { expect, test } from "vitest"
import { readFile, readdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { Catalog, Coverage, SourceLock } from "../scripts/lib/compliance-types.ts"
import { sourceVersionErrors } from "../scripts/lib/source-versions.mts"
import { verifyRepository } from "../scripts/lib/compliance-verify.mts"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const readJson = async <T = SourceLock>(path: string): Promise<T> => JSON.parse(await readFile(resolve(root, path), "utf8"))

test("the machine-readable conformance graph is internally valid", async () => {
  const report = await verifyRepository(root)
  expect(report.errors).toEqual([])
  expect(report.valid).toBe(true)
  expect(report.summary.components).toBe(49)
})

test("the consumed theme, upstream compatibility and historical baseline have separate identities", async () => {
  const lock = await readJson("upstream/sources.lock.json")
  const coverage = await readJson<Coverage>("compliance/coverage/components.json")
  const manifest = await readJson<{ dependencies: Record<string, string> }>("package.json")
  expect(sourceVersionErrors(lock, coverage, manifest.dependencies)).toEqual([])
  const tokens = lock.sources.find(source => source.id === "dads-design-tokens")!
  expect(tokens.status).toBe("compatibility-lag")
  expect(tokens.compatibilityVersion).toBe("2.18.1")
  const theme = lock.sources.find(source => source.id === "dads-tailwind-theme")!
  expect(theme.compatibilityVersion).toBe("2.18.2")
  expect(theme.consumedVersion).toBe(manifest.dependencies['@digital-go-jp/tailwind-theme-plugin'])
  expect(lock.implementationBaseline.version).toBe("2.16.0")
  const drifted = structuredClone(lock)
  drifted.sources.find(source => source.id === "dads-tailwind-theme")!.consumedVersion = "1.0.1"
  expect(sourceVersionErrors(drifted, coverage, manifest.dependencies)).toContain(
    'dads-tailwind-theme: consumed version differs from dependency manifest')
  const hiddenLag = structuredClone(lock)
  hiddenLag.sources.find(source => source.id === "dads-design-tokens")!.status = "current"
  expect(sourceVersionErrors(hiddenLag, coverage, manifest.dependencies)).toContain(
    'dads-design-tokens: compatibility lag must be explicit')
  expect(sourceVersionErrors(lock, { ...coverage, sourceVersion: "2.18.2" }, manifest.dependencies))
    .toContain('coverage: implementation baseline differs from source lock')
})

test("verified claims always carry review evidence", async () => {
  const directory = resolve(root, "compliance/requirements")
  const names = (await readdir(directory)).filter((name) => name.endsWith(".json"))
  const catalogs = await Promise.all(names.map((name) => readJson<Catalog["data"]>(`compliance/requirements/${name}`)))
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
