# 開発・配布ガイド / Development and distribution

## 課題と解決 / Problem and solution

source pathや共有TGZ配置に依存すると、利用repoを独立して構築できません。
公開確認後はexact registry versionを使用し、lockfileを利用repoで管理します。
Source paths and shared archive directories couple repositories together.
An independently verified registry version gives consumers their own reproducible lockfile.

## 使い方 / Usage

公式Nuxt module builderの構成を維持します。runtimeは`src/runtime/app`、純粋関数は
`src/runtime/core`です。layout、route、API、認証、業務状態は追加しません。
Use the existing Nuxt module-builder structure and keep domain behavior in the consuming app.

```sh
pnpm install --frozen-lockfile
pnpm compliance:verify
pnpm exec playwright install --with-deps chromium
pnpm test
pnpm typecheck
pnpm build
pnpm pack --pack-destination ./artifacts
```

`prepack`はcompliance/test/type/buildを実行します。配布検証でこれを省略しません。
`pnpm pack --dry-run`で成功したと扱わず、実際のarchiveを検査します。
Prepack runs the existing gates; validate an actual archive rather than claiming a dry-run result.

試験は純粋関数、公開path、compliance、Nuxt SSR fixture、playground型とbuildを含みます。
Existing tests cover pure functions, public paths, compliance, the SSR fixture and playground builds.

## 結果と公開ゲート / Result and release gates

1. 空storeのfrozen installでlockを変更せず導入する。
2. 既存のcompliance/test/type/buildを通し、pack lifecycleを実行する。
3. archiveの公開exportsと型、README、全license/noticeを確認する。
4. source checkoutを使わないconsumerへarchiveを導入し、core import、型、SSR buildを試す。
5. 配布物の秘密pattern、製品固有文言、絶対path、不要なfixture/cache/logを限定検査する。
6. 対象・内容の確認後にだけ公開し、実registryのversion/integrityを確認する。
7. 利用repoをexact registry参照と新規install/build/testへ移行する。

These gates establish an archive that an independent consumer can use. They do not publish it.
Limited pattern checks are not a complete secret audit or dependency-vulnerability scan.

公開入口は`@nuxtjp/ui`と`@nuxtjp/ui/core`です。peer Nuxt/Vueとその他依存は公開registryを使います。
The public entries are the module and core subpath; external dependencies resolve from the public registry.

既存のTrusted Publisherによるstage作成と、npm所有者による正式公開の二段階を維持します。
共有private管理repoのtokenをこのpackageへ結び付けません。provenanceの設定だけで公開完了とはしません。
Existing Trusted Publisher staging and npm owner approval remain separate release gates.
No shared private-management token is used, and a provenance setting is not proof of publication.

## Versioning and license

API変更はSemVerで管理し、0.xでも破壊的変更を説明します。UI 0.2.0ではtheme v2の旧CSSクラス削除を明示し、Layer 0.5.0のUI peerを更新します。Nuxt・Nuxt UI・Vueの互換性下限は維持します。
UI 0.2.0 documents the theme v2 utility removals; Layer 0.5.0 selects that exact UI peer. Existing Nuxt, Nuxt UI and Vue compatibility floors remain unchanged.
manifest/LICENSEはApache-2.0、従前MITはLICENSE-PREVIOUSに保持されています。
LICENSE、NOTICE、LICENSE-PREVIOUS、THIRD_PARTY_NOTICESは改変せず配布物に残します。

Nuxt UI 4.12.0とNuxt Icon 2.5.1のpinを維持し、appと共有するpeerとして宣言します。
Nuxt UI 4.12.0 and Nuxt Icon 2.5.1 remain pinned host peers for module resolution.
