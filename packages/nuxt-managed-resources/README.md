# @nuxtjp/managed-resources

管理資源、リポジトリの準備状態、責任関係を一覧・詳細画面で表示できます。

## 利用前の確認

実装済みの範囲、必要な依存関係、検証コマンドを以下の英語説明に併記しています。操作・配備・公開は、それぞれの権限と設定を確認してから実施してください。

## 使い方

リポジトリ内のサンプル・スキーマ・実装を確認し、用途に必要な入力を明示して利用します。下記のGetting startedに、現行設定に対応する検証コマンドを示しています。

検証結果は実行した範囲だけを示します。未実装の機能、未設定の接続、配備環境の確認を合格扱いにしないでください。

## English

Display managed resources, repository readiness and responsibility relationships in a Nuxt interface.

## What you can do

- Filter and summarize caller-owned resource descriptors.
- Link resource details through declared application routes.

## Current scope

The module renders supplied metadata; discovery, provider access and authorization belong to the application.

Package distribution is not activated by this documentation. Use the checked-in source and the declared dependency versions; published availability must be verified separately.

## Getting started

Use `pnpm@10.29.3` and the Node.js version declared in `engines` in `package.json`. Run from this repository:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

## Examples and interface details

## Contract

The closed list and detail contracts use:

- `nuxtjp://managed-resources/list/v1`
- `nuxtjp://managed-resources/detail/v1`

Unknown fields and `external_actions: true` are rejected. The list guard also
requires `resource_count === resources.length`.

Repository identity keeps three concerns separate:

- `organization_id`: the organization holding operating custody;
- `placement_scope`: the classified local placement;
- `source_organization_id`: an optional, separately registered source host.

`source_organization_id: null` means that no distinct source host is declared;
it must not be inferred from a local path.

```ts
import { isManagedResourcesDocument } from '@nuxtjp/managed-resources/guards'

function acceptProjection(value: unknown) {
  if (!isManagedResourcesDocument(value)) {
    throw new Error('Invalid managed-resources projection')
  }
  return value
}
```

Types are exported from `@nuxtjp/managed-resources/types`, pure selectors from
`@nuxtjp/managed-resources/core`, and the JSON Schema from
`@nuxtjp/managed-resources/schema`.

The consumer owns acquisition, authentication, authorization, storage, and
detail-page routing. The module owns only its strict display contract and
accessible presentation.

## Documentation and source

[Interface reference](docs/interface-reference.md)

[Usage guide](docs/getting-started.md)

[Schemas](schemas) · [Implementation and public interfaces](src) · [Verification cases](test) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [License](LICENSE) · [Attribution notices](NOTICE)
