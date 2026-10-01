import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, expect, test } from "vitest"
import { repositoryFileExists } from "../scripts/lib/repository-path.mjs"

const temporaryDirectories = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })))
})

test("accepts files contained by the repository", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "nuxtjp-repository-path-"))
  temporaryDirectories.push(temporary)
  const root = join(temporary, "repository")
  await mkdir(root)
  await writeFile(join(root, "evidence.txt"), "reviewed")
  await expect(repositoryFileExists(root, "evidence.txt")).resolves.toBe(true)
})

test("rejects absolute, traversal and external symlink paths", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "nuxtjp-repository-path-"))
  temporaryDirectories.push(temporary)
  const root = join(temporary, "repository")
  const outside = join(temporary, "outside.txt")
  await mkdir(root)
  await writeFile(outside, "private")
  await symlink(outside, join(root, "linked.txt"))
  await expect(repositoryFileExists(root, outside)).resolves.toBe(false)
  await expect(repositoryFileExists(root, "../outside.txt")).resolves.toBe(false)
  await expect(repositoryFileExists(root, "linked.txt")).resolves.toBe(false)
})
