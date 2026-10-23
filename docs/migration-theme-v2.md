# Theme v2 migration / テーマv2移行

UI **0.2.0** uses the official published `@digital-go-jp/tailwind-theme-plugin@2.0.0` artifact.
The exact caller pair is **management-layout 0.5.0 + UI 0.2.0**. Verify registry publication before installing these versions.
Nuxt, Nuxt UI, Vue, Node and TypeScript requirements are unchanged. No upstream build toolchain is required by consumers.

## Breaking CSS utilities

| Removed | Replacement |
|---|---|
| `leading-1-0` | `leading-100` |
| `leading-1-2` / `leading-1-3` / `leading-1-4` | `leading-120` / `leading-130` / `leading-140` |
| `leading-1-5` / `leading-1-6` / `leading-1-7` / `leading-1-75` | `leading-150` / `leading-160` / `leading-170` / `leading-175` |
| `--leading-1-*` custom properties | corresponding numeric `--leading-*` property above |
| `list-lower-latin` / `list-circle` / `list-square` | `list-[lower-latin]` / `list-[circle]` / `list-[square]` |

Upstream also removes v3-only `desktop` / `desktop-admin` breakpoints and aspect aliases.
This Nuxt module uses the v4 entry, where those aliases were already absent. Define an application breakpoint only if the application needs it.
See the [fixed upstream migration guide](https://github.com/digital-go-jp/tailwind-theme-plugin/blob/994c888f84fa5c29059b1b06288c999493e46721/MIGRATION.md).

The maintained UI and management Layer sources contain no removed utility usages.
External callers must inspect their own templates, custom properties and generated class names before upgrading.
The opacity-gray-536 alpha changes from .54 to .536. The official Sans stack drops Apple/system font names; the module retains its explicit local Japanese fallbacks and does not fetch remote fonts.

## Responsibilities and verification

The UI module owns the DADS theme and generic Vue controls. The management Layer selects the exact UI peer and owns layout; applications own business routes and service-specific policy.
Do not add a second tokens/theme dependency to the Layer or import the HTML/React reference runtime.

Browser acceptance covers compiled v2 color/line-height, keyboard and skip-link focus, disabled steps, live progress and accessible names.
The existing independent npm/pnpm consumer checks are reused for both UI and Layer archives, including types, production build and SSR.
Actual screen-reader, browser zoom, Windows high-contrast and application-level WCAG evaluation remain separate gates.

開発時はREADMEのコマンドでロックしたChromiumを導入してから試験します。製品の実装基準・部品の採用状況は、テーマの版番号と分けて扱います。
