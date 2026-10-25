/** Traverse active graphs within the selected workspace boundary. Projects must include its root once. */
export function installedDependencies(root: string, target: string, version?: string, options?: { allowMissing?: boolean; projects?: readonly string[] }): string[];
