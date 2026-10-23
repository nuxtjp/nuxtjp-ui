# Conformance Status

Implementation baseline reviewed: 2026-08-05. Bounded upstream applicability reviewed: 2026-10-23.

The [2.18.1 applicability record](../governance/upstream-reviews/2026-10-23.md) maps every changed file to a reason and requirement.
No runtime port, coverage promotion or implementation baseline change is adopted. Upstream is now 2.18.2; the table records our retained baseline.

## Baselines

| Source | Reviewed version | Status |
|---|---|---|
| DADS documents | v2.16.0, updated 2026-07-22 | retained implementation baseline |
| DADS Figma | v2.16.0, published 2026-07-08 | retained implementation baseline |
| design-tokens | v2.0.1 | explicit compatibility through 2.14.0 |
| Tailwind theme plugin | v1.0.1 | explicit compatibility through 2.14.0 |
| Dashboard web page | updated 2026-07-17 | tracked current |
| Dashboard guidebook asset | updated 2026-03-31 | tracked current |

The lock file is authoritative for source URLs, versions, commit hashes, and probes.

## Present claim

The repository provides machine-readable tracking for primary sources, requirements, and all 49 DADS components; a reusable Nuxt UI derivative module; an explicit module, Layer, and application boundary; and review-required upstream detection.

This is not certification or a claim of full DADS conformance. Every adopted Vue component requires its own semantic, interaction, and accessibility evidence.

## Open release gates

- Page-level JIS X 8341-3:2016 AA and WCAG 2.2 A/AA evaluation
- Keyboard, screen-reader, 200%/400% zoom, and Windows high-contrast review
- Equivalent tables or text summaries for charts and topology
- DADS 2.15/2.16 versus official token/plugin delta review
- Component-specific evidence for every adopted DADS component

A `localComponent` value in coverage identifies a review candidate. A candidate with `status: planned` has not completed DADS-specific usage and accessibility review and is not included in the implemented claim.

Automated accessibility checks will remain supporting evidence rather than a substitute for manual evaluation.

## Verification

```sh
node scripts/verify-compliance.mjs
node scripts/check-upstream.mjs
```

The first command verifies internal references and recorded compatibility gaps. The second reads public primary sources and reports changes as `review-required`; it never changes the lock or implementation.
