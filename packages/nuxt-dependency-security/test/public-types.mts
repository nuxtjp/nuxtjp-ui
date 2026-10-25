import {applySecurityPatches,installedDependencies,verifyProject} from '@nuxtjp/dependency-security';
const config: (root: string) => void = applySecurityPatches;
const resolve: (root: string, name: string, version?: string) => string[] = installedDependencies;
void config; void resolve;
// @ts-expect-error Project selection must be explicit text.
applySecurityPatches({});

const check: (project: string) => { exitCode: number; stdout: string; stderr: string } = verifyProject;
void check;

verifyProject('.', { projects: ['.', 'apps/web'] });
installedDependencies('.', 'braces', '3.0.3', { projects: ['.', 'apps/web'] });
// @ts-expect-error Each project must be a path string.
verifyProject('.', { projects: [1] });
