/** Configure reviewed pnpm backports. No installation or network access occurs. */
export function applySecurityPatches(project: string): void;
/** Resolve exact active packages; reject external-workspace resolution and missing targets. */
export function installedDependencies(root: string, target: string, version?: string): string[];
