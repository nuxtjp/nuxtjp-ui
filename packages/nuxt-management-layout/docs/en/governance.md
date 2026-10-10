# Primary-source Governance

`upstream/sources.lock.json` tracks Nuxt Layers, Nuxt UI Dashboard, DADS, and the Dashboard Guide as separate primary-source axes. DADS foundation implementation evidence is delegated to `@nuxtjp/ui`; layout and information-hierarchy evidence stays here.

Run `pnpm upstream:check` to compare reviewed public markers. A mismatch or unavailable source is `review-required`. A maintainer reviews the primary source, license, Layer impact, requirements, implementation, tests, and migration notes before changing the lock.

The check permits only HTTPS official hosts and bounds redirects, time, and response size. It does not update the lock, package, implementation, dependencies, or status.

`implemented` means artifacts and tests exist. `verified` additionally requires reviewed requirement-specific manual evidence. Automated test success never promotes a requirement to `verified`.
