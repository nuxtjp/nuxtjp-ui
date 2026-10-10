import Ajv2020 from 'ajv/dist/2020.js'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const datePattern = /^\d{4}-\d{2}-\d{2}$/u

function validUri(value) {
  try {
    return Boolean(new URL(value).protocol)
  } catch {
    return false
  }
}

export async function validateSchemas(root, documents) {
  const sourceSchema = await readJson(resolve(root, 'compliance/schema/source-lock.schema.json'))
  const requirementSchema = await readJson(resolve(root, 'compliance/schema/requirements.schema.json'))
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    formats: { date: datePattern, uri: validUri }
  })
  return [
    ...validate(ajv, sourceSchema, documents.lock, 'source-lock'),
    ...validate(ajv, requirementSchema, documents.requirements, 'requirements')
  ]
}

function validate(ajv, schema, value, label) {
  const check = ajv.compile(schema)
  if (check(value)) return []
  return (check.errors ?? []).map(error =>
    `${label}${error.instancePath || '/'} ${error.message ?? 'is invalid'}`)
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}
