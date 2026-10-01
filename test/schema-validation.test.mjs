import { readFile, readdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { expect, test } from "vitest"
import { validateComplianceSchemas } from "../scripts/lib/schema-validate.mjs"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"))

async function documents() {
  const names = (await readdir(resolve(root, "compliance/requirements")))
    .filter((name) => name.endsWith(".json"))
    .sort()
  return {
    lock: await readJson("upstream/sources.lock.json"),
    coverage: await readJson("compliance/coverage/components.json"),
    catalogs: await Promise.all(names.map(async (name) => ({
      name,
      data: await readJson(`compliance/requirements/${name}`)
    })))
  }
}

test("accepts the checked-in documents against strict JSON Schemas", async () => {
  expect(await validateComplianceSchemas(root, await documents())).toEqual([])
})

test("rejects unknown fields and invalid calendar dates", async () => {
  const input = await documents()
  input.lock.sources[0].unexpected = true
  input.coverage.checkedAt = "2026-02-30"
  const errors = await validateComplianceSchemas(root, input)
  expect(errors.some((error) => error.includes("additional properties"))).toBe(true)
  expect(errors.some((error) => error.includes("format"))).toBe(true)
})

test("requires evidence references for implemented requirements", async () => {
  const input = await documents()
  const requirement = input.catalogs[0].data.requirements[0]
  requirement.status = "implemented"
  requirement.artifacts = []
  requirement.tests = []
  const errors = await validateComplianceSchemas(root, input)
  expect(errors.filter((error) => error.includes("must NOT have fewer than 1 items"))).toHaveLength(2)
})

test("rejects repository paths that can escape the package", async () => {
  const input = await documents()
  const requirement = input.catalogs[0].data.requirements[0]
  requirement.status = "implemented"
  requirement.artifacts = ["../outside"]
  requirement.tests = ["C:\\outside"]
  const errors = await validateComplianceSchemas(root, input)
  expect(errors.filter((error) => error.includes("must match pattern"))).toHaveLength(2)
})
