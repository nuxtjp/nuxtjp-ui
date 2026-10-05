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

初回bootstrap、npm scope権限、独立repoのtrusted publishing設定はまだ確認・実行していません。
共有private管理repoのtokenをこのpackageへ結び付けません。provenanceの設定だけで公開完了とはしません。
First bootstrap, scope permission and trusted publishing remain separate release conditions.
No shared private-management token is used, and a provenance setting is not proof of publication.

## Versioning and license

API変更はSemVerで管理し、0.xでも破壊的変更を説明します。今回は修正版へ更新し、Nuxt・Nuxt UI・Vueの互換性下限を引き上げます。
This revision updates patched dependencies and raises the Nuxt, Nuxt UI and Vue compatibility floors; it adds no UI behavior.
manifest/LICENSEはApache-2.0、従前MITはLICENSE-PREVIOUSに保持されています。
LICENSE、NOTICE、LICENSE-PREVIOUS、THIRD_PARTY_NOTICESは改変せず配布物に残します。

Nuxt UI 4.11.3とNuxt Icon 2.5.1へpinを更新し、appと共有するpeerとして宣言します。
The pins are updated to Nuxt UI 4.11.3 and Nuxt Icon 2.5.1 and declared as host peers for module resolution.
