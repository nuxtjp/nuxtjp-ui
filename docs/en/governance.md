# Upstream Governance

## Purpose

This repository records the exact primary source, decision, implementation, and test behind each adopted rule. Detection and adoption are separate activities so that upstream changes cannot silently alter an application.

## Version axes

`upstream/sources.lock.json` tracks DADS documents, the component index, accessibility guidance, usage notices, official packages, examples, and dashboard guidance independently.

The important current gap is explicit:

- DADS documents and Figma are version 2.16.0.
- `@digital-go-jp/design-tokens` 2.0.1 explicitly maps only through Figma/DADS 2.14.0.
- `@digital-go-jp/tailwind-theme-plugin` 1.0.1 also explicitly maps only through 2.14.0.
- Official HTML and React examples exist; there is no official Vue or Nuxt implementation.

The official packages are therefore not represented as proven fully compatible with DADS 2.16.0.

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
