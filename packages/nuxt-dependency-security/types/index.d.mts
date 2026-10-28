export interface GraphOptions { projects?: readonly string[] }
/** Configure reviewed pnpm backports. No installation or network access occurs. */
export function applySecurityPatches(project: string): void;
/** Resolve exact active packages; reject external-workspace resolution and missing targets. */
export function installedDependencies(root: string, target: string, version?: string, options?: GraphOptions & { allowMissing?: boolean }): string[];
/** Run the known dependency regressions, returning bounded local output and exit status. */
export function verifyProject(project: string, options?: GraphOptions): { exitCode: number; stdout: string; stderr: string };
/** Accept only reported advisories with installed targets whose regressions pass. */
export function verifyAuditedAdvisories(project: string, advisories: string[], options?: GraphOptions): void;
/** Check audit totals and bind each advisory to an active, regression-tested target. */
export function verifyAuditReport(project: string, report: unknown, options?: GraphOptions): void;
