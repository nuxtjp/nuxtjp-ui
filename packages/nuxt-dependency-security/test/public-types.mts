import {applySecurityPatches,installedDependencies} from '@nuxtjp/dependency-security';
const config: (root: string) => void = applySecurityPatches;
const resolve: (root: string, name: string, version?: string) => string[] = installedDependencies;
void config; void resolve;
// @ts-expect-error Project selection must be explicit text.
applySecurityPatches({});
