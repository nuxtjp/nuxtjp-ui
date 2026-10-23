# Upstream Governance

## Purpose

This repository records the exact primary source, decision, implementation, and test behind each adopted rule. Detection and adoption are separate activities so that upstream changes cannot silently alter an application.

## Version axes

`upstream/sources.lock.json` tracks DADS documents, the component index, accessibility guidance, usage notices, official packages, examples, and dashboard guidance independently.

The reviewed upstream document/Figma version is 2.18.2; the historical implementation/component baseline remains 2.16.0.
Published tokens 2.1.0 explicitly map through 2.18.1; this lag is retained. Consumed theme plugin 2.0.0 explicitly maps through 2.18.2 and is checked against the manifest.
The theme uses the published token-based artifact; no duplicate direct tokens dependency, React runtime or upstream development toolchain is introduced.
[Theme v2 review](../governance/upstream-reviews/2026-10-23-theme-v2.md) records complete fixed-head applicability, license and consumer evidence. Upstream compatibility does not certify the Vue components or a consuming application.

## Review workflow

1. Run `node scripts/check-upstream.mjs` to compare public markers and commits.
2. Record any change or unavailability as `review-required`.
3. Review the changed primary source, license, and breaking impact.
4. Update requirement IDs, component scope, implementation, tests, and migration notes.
5. Update lock expectations and dates only after review.
6. Mark an item `verified` only when reviewed evidence exists.

The check does not mutate files, dependencies, implementations, or conformance status.

## Status meaning

- `not-assessed`: applicability is undecided.
- `planned`: applicable, but implementation or evidence is incomplete.
- `implemented`: artifacts and tests exist.
- `verified`: requirement-specific evidence was reviewed.
- `exception`: reason, risk, and compensating control were approved.
- `not-applicable`: a reviewed rationale establishes non-applicability.

## Representation

Describe this package as an independent NuxtJP derivative. Do not describe it as Digital Agency official, certified, or wholly conformant. State coverage through the requirement catalogs and component inventory instead.
