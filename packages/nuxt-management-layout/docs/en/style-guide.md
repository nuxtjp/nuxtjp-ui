# Management Layout Style Guide

This Layer references [DADS v2.16.0](https://design.digital.go.jp/dads/), its [style-guide guidance](https://design.digital.go.jp/dads/guidance/style-guides/), [accessibility guidance](https://design.digital.go.jp/dads/guidance/accessibility/), and the [Dashboard Guide](https://www.digital.go.jp/resources/dashboard-guidebook).

`@nuxtjp/ui` owns DADS foundation tokens and primitives. This Layer owns only management-page placement and information hierarchy and makes no official or blanket DADS conformance claim.

Pages provide a pre-chrome skip link, primary navigation, current-page navbar, route-derived breadcrumbs, a main landmark, and one main page heading. Information progresses from overview to a narrowed list and then detail.

Transport, lifecycle, health, and actionability remain separate. Each summary uses text in addition to color and shows source, observation time, stale state, and unavailable observation. A blocked action presents its reason and prerequisite path instead of an inert control.

Navigation targets are at least 44px. Focus and foundation colors come from `@nuxtjp/ui` and must not be removed by consumer CSS.

Each consuming page remains responsible for headings and labels, keyboard and focus order, screen-reader behavior, contrast, reflow at 200%/400%, equivalent chart or topology content, and JIS X 8341-3:2016 AA plus WCAG 2.2 A/AA evidence.
