# Security policy

## Supported versions

Until 1.0, security fixes are applied to the latest published minor version only. Consumers should keep an exact lockfile and update after reviewing release notes.

## Reporting a vulnerability

Use GitHub private vulnerability reporting from the repository **Security** tab. If private reporting is not enabled, contact the repository owners through a private organization channel before sharing details. Do not open a public issue containing an exploit, credential, personal information, or an undisclosed vulnerability.

Include:

- affected version or commit;
- minimal reproduction and expected security boundary;
- impact and required preconditions;
- whether credentials or customer data may be involved;
- a safe way to contact the reporter.

Maintainers should acknowledge a report privately, validate the boundary, coordinate a fix and disclosure, and avoid exposing customer-specific evidence in this repository.

## Package boundary

This package owns theme policy, generic presentation components and pure browser helpers. It must not receive credentials, tokens, customer records, product routes or provider-specific privileged operations. Consuming applications retain layout selection, authentication, authorization, secret storage, audit and incident-response responsibilities.

Upstream watch jobs have `contents: read` permission and only report `review-required`. They do not update dependencies, locks, implementation, or conformance status.

## Runtime assets

The module disables Nuxt UI's automatic font module before dependency installation. A transitive `@nuxt/fonts` entry may remain in the package-manager lock because Nuxt UI declares it, but it must not appear in Nuxt's installed-module list. The Japanese font stack uses only fonts already available on the device.

The exact `@iconify-json/lucide` package is bundled into the Nuxt Icon custom collection. The default icon path must not fetch a collection from a remote provider at runtime. A consumer that adds another collection owns that collection's source, license, integrity, and network policy.

## Package publication

Before publishing, maintainers must:

- install from the exact lockfile and run compliance, unit, consumer, type, and production-build gates;
- inspect `pnpm pack --dry-run` and keep the archive limited to `dist`, license, README, security policy, and third-party notices;
- reject archives containing credentials, customer data, local absolute paths, fixtures, tests, source-only scripts, caches, or logs;
- publish an exact version with npm provenance through trusted publishing or another short-lived identity;
- record and independently verify the registry archive digest before a consumer changes its lockfile.

Local release candidates are built in the Wonderland `.artifacts/npm/` staging directory and copied to each consumer's ignored `vendor/` directory. Consumers install only their repository-local archive with a frozen lockfile. Neither location is a publication source or a place for credentials. Long-lived registry tokens must not be stored in a repository, archive, browser configuration, or `vendor/` directory.
