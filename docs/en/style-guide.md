# NuxtJP UI Style Guide

## Status and sources

This repository is an independent Nuxt adaptation informed by the Digital Agency Design System (DADS). It is not an official or certified Digital Agency implementation. DADS is a shared foundation rather than a finished service brand, so this repository maintains its own service-level style guide.

- [DADS v2.16.0](https://design.digital.go.jp/dads/)
- [Creating a style guide](https://design.digital.go.jp/dads/guidance/style-guides/)
- [DADS component index](https://design.digital.go.jp/dads/components/)
- [Dashboard design guide](https://www.digital.go.jp/resources/dashboard-guidebook)

## Ownership boundary

This package owns semantic tokens, focus treatment, locale integration, page headers, read states, metric patterns, copy fallback, and baseline accessibility behavior. It also owns upstream, requirement, implementation, test, and exception traceability.

The management Layer owns reusable layout and navigation framing. The consuming application owns business language, route data, authorization, data access, mutations, state decisions, recovery guidance, audit events, and disclosure controls. Coela implements this application layer without copying visual rules.

## Page structure

1. Put a skip link before application chrome.
2. Reserve the header for service identity and global actions.
3. Expose navigation and main content as distinct landmarks.
4. Give each page one main heading plus purpose, audience, and update time.
5. Progress from overview to filtered list to detail.
6. Keep status and its related action together; explain disabled actions.

## State model

Do not compress unrelated conditions into a single ambiguous status. Model transport, lifecycle, health, and actionability independently. Use a short text label and explanation, never color alone. Keep “not observed” distinct from a measured zero.

## Dashboards

Define purpose, audience, decision, action, and data source before choosing a chart. Show observation time, freshness, and unavailable states. Choose visualizations from comparison, trend, composition, or relationship needs, and provide an equivalent table or text summary.

## Accessibility

Adopting DADS does not by itself establish conformance. The consuming service remains responsible for page content and operations.

- Preserve semantic headings, labels, relationships, and landmarks.
- Make every operation keyboard-accessible with visible focus.
- Check text and non-text contrast and applicable target size.
- Announce dynamic updates, errors, and loading states in text and semantics.
- Gate public release on page-level JIS X 8341-3:2016 AA and WCAG 2.2 A/AA evidence.

Automated checks assist but do not replace keyboard, zoom, screen-reader, high-contrast, and cognitive-load review.

## Changes

Upstream detection never updates implementation automatically. Review `upstream/sources.lock.json`, requirements, impact, implementation, tests, and evidence before raising a status. See [conformance status](./conformance.md).
