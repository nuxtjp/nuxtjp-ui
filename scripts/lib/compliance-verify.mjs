import { readFile, readdir } from "node:fs/promises"
import { resolve } from "node:path"
import { repositoryFileExists } from "./repository-path.mjs"
import { validateComplianceSchemas } from "./schema-validate.mjs"
import { assertUpstreamUrl } from "./upstream-http.mjs"

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"))
}

function duplicates(values) {
  const seen = new Set()
  return values.filter((value) => seen.size === seen.add(value).size)
}

function addUniqueErrors(errors, label, values) {
  for (const value of duplicates(values)) errors.push(`${label}: duplicate ${value}`)
}

function verifyRequirementShape(requirement, errors) {
  const statuses = new Set(["not-assessed", "planned", "implemented", "verified", "exception", "not-applicable"])
  const levels = new Set(["must", "should", "may"])
  if (!/^(DADS-V2|DASH-2026|NJDS)-[A-Z0-9-]+$/.test(requirement.id ?? "")) {
    errors.push(`${requirement.id ?? "requirement"}: invalid id`)
  }
  if (!statuses.has(requirement.status)) errors.push(`${requirement.id}: invalid status`)
  if (!levels.has(requirement.localLevel)) errors.push(`${requirement.id}: invalid local level`)
  for (const field of ["title", "sourceId", "sourceUrl", "section"]) {
    if (!requirement[field]) errors.push(`${requirement.id}: missing ${field}`)
  }
}

async function loadCatalogs(root) {
  const directory = resolve(root, "compliance/requirements")
  const files = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort()
  return Promise.all(files.map(async (name) => ({
    name,
    data: await readJson(resolve(directory, name))
  })))
}

async function verifyEvidence(root, requirement, errors) {
  if (["implemented", "verified"].includes(requirement.status)) {
    if (!requirement.artifacts?.length) errors.push(`${requirement.id}: missing artifacts`)
    if (!requirement.tests?.length) errors.push(`${requirement.id}: missing tests`)
    for (const path of [...(requirement.artifacts ?? []), ...(requirement.tests ?? [])]) {
      if (!(await repositoryFileExists(root, path))) errors.push(`${requirement.id}: invalid or missing ${path}`)
    }
  }
  if (requirement.status === "verified" && !requirement.evidence?.length) {
    errors.push(`${requirement.id}: verified without evidence`)
  }
  if (requirement.status === "exception" && !requirement.exceptionReason) {
    errors.push(`${requirement.id}: exception without reason`)
  }
}

export async function verifyRepository(root) {
  const errors = []
  const lock = await readJson(resolve(root, "upstream/sources.lock.json"))
  const coverage = await readJson(resolve(root, "compliance/coverage/components.json"))
  const catalogs = await loadCatalogs(root)
  errors.push(...await validateComplianceSchemas(root, { lock, coverage, catalogs }))
  const sources = Array.isArray(lock.sources) ? lock.sources : []
  const components = Array.isArray(coverage.components) ? coverage.components : []
  const requirements = catalogs.flatMap(({ data }) => Array.isArray(data.requirements) ? data.requirements : [])
  const sourceIds = new Set(sources.map(({ id }) => id))
  const requirementIds = new Set(requirements.map(({ id }) => id))
  if (lock.reviewPolicy !== "review-required") errors.push("lock: review policy must require review")
  if (lock.schemaVersion !== 1) errors.push("lock: unsupported schema version")
  addUniqueErrors(errors, "source", sources.map(({ id }) => id))
  addUniqueErrors(errors, "requirement", requirements.map(({ id }) => id))
  addUniqueErrors(errors, "component", components.map(({ id }) => id))
  for (const source of sources) {
    if (source.reviewRequired !== true) errors.push(`${source.id}: reviewRequired must be true`)
    if (!source.probes?.length) errors.push(`${source.id}: no upstream probe`)
    for (const probe of Array.isArray(source.probes) ? source.probes : []) {
      try {
        assertUpstreamUrl(probe.url, probe.type)
      } catch (error) {
        errors.push(`${source.id}: ${error instanceof Error ? error.message : "invalid upstream URL"}`)
      }
    }
  }
  for (const requirement of requirements) {
    verifyRequirementShape(requirement, errors)
    if (!sourceIds.has(requirement.sourceId)) errors.push(`${requirement.id}: unknown source`)
    await verifyEvidence(root, requirement, errors)
  }
  if (coverage.sourceVersion !== "2.16.0") errors.push("coverage: DADS version must be 2.16.0")
  if (components.length !== 49) errors.push("coverage: expected 49 components")
  for (const component of components) {
    if (!/^[a-z0-9-]+$/.test(component.id ?? "")) errors.push("coverage: invalid component id")
    if (!new Set(["core", "conditional", "not-default"]).has(component.profile)) {
      errors.push(`${component.id}: invalid profile`)
    }
    for (const id of component.requirementIds ?? []) {
      if (!requirementIds.has(id)) errors.push(`${component.id}: unknown requirement ${id}`)
    }
    if (["implemented", "verified"].includes(component.status) && !component.localComponent) {
      errors.push(`${component.id}: implemented without local component`)
    }
    if (component.localComponent && !(await repositoryFileExists(root, component.localComponent))) {
      errors.push(`${component.id}: invalid or missing ${component.localComponent}`)
    }
  }
  for (const id of ["dads-design-tokens", "dads-tailwind-theme"]) {
    const source = sources.find((item) => item.id === id)
    if (source?.status !== "compatibility-lag" || !source.compatibilityThrough?.includes("2.14.0")) {
      errors.push(`${id}: DADS 2.14 compatibility lag is not recorded`)
    }
  }
  return {
    valid: errors.length === 0,
    summary: {
      sources: sources.length,
      requirements: requirements.length,
      components: components.length
    },
    errors
  }
}
