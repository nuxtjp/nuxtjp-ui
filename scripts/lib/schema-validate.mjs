import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import Ajv2020 from "ajv/dist/2020.js"

const schemaFiles = {
  lock: "source-lock.schema.json",
  coverage: "component-coverage.schema.json",
  catalog: "requirement-catalog.schema.json"
}

function isCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [, year, month, day] = match.map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}

function isHttpsUri(value) {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && !url.username && !url.password
  } catch {
    return false
  }
}

function formatErrors(label, errors = []) {
  return errors.map((error) => {
    const location = error.instancePath || "/"
    return `schema:${label}${location}: ${error.message}`
  })
}

async function loadSchemas(root) {
  const directory = resolve(root, "compliance/schema")
  return Object.fromEntries(await Promise.all(Object.entries(schemaFiles).map(async ([key, file]) => [
    key,
    JSON.parse(await readFile(resolve(directory, file), "utf8"))
  ])))
}

export async function validateComplianceSchemas(root, documents) {
  const schemas = await loadSchemas(root)
  const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true, strict: true })
  ajv.addFormat("date", { type: "string", validate: isCalendarDate })
  ajv.addFormat("uri", { type: "string", validate: isHttpsUri })
  const validators = Object.fromEntries(Object.entries(schemas).map(([key, schema]) => [
    key,
    ajv.compile(schema)
  ]))
  const errors = []
  if (!validators.lock(documents.lock)) errors.push(...formatErrors("source-lock", validators.lock.errors))
  if (!validators.coverage(documents.coverage)) {
    errors.push(...formatErrors("component-coverage", validators.coverage.errors))
  }
  for (const catalog of documents.catalogs) {
    if (!validators.catalog(catalog.data)) {
      errors.push(...formatErrors(`requirements/${catalog.name}`, validators.catalog.errors))
    }
  }
  return errors
}
