import {applySecurityPatches,installedDependencies,verifyProject} from '@nuxtjp/dependency-security';
const config: (root: string) => void = applySecurityPatches;
const resolve: (root: string, name: string, version?: string) => string[] = installedDependencies;
void config; void resolve;
// @ts-expect-error Project selection must be explicit text.
applySecurityPatches({});

const check: (project: string) => { exitCode: number; stdout: string; stderr: string } = verifyProject;
void check;
