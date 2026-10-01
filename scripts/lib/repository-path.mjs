import { realpath, stat } from "node:fs/promises"
import { isAbsolute, relative, resolve, sep } from "node:path"

function isContained(root, candidate) {
  const path = relative(root, candidate)
  return path !== "" && path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path)
}

export async function repositoryPathExists(root, candidate, options = {}) {
  if (typeof candidate !== "string" || !candidate || isAbsolute(candidate) || candidate.includes("\\")) {
    return false
  }
  const rootPath = await realpath(root)
  const lexicalPath = resolve(rootPath, candidate)
  if (!isContained(rootPath, lexicalPath)) return false
  try {
    const resolvedPath = await realpath(lexicalPath)
    if (!isContained(rootPath, resolvedPath)) return false
    const details = await stat(resolvedPath)
    return options.fileOnly ? details.isFile() : true
  } catch {
    return false
  }
}

export const repositoryFileExists = (root, candidate) => (
  repositoryPathExists(root, candidate, { fileOnly: true })
)
