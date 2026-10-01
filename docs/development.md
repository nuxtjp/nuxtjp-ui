# 開発・配布ガイド

## 公式構成との対応

- [Nuxt module starter](https://github.com/nuxt/starter/tree/module)と`@nuxt/module-builder`を使用する。
- module runtimeは`src/runtime/app`、純粋関数は`src/runtime/core`に置く。
- component、composable、設定keyは`NuxtJp`／`nuxtJpUi`でprefixする。
- Nuxt UIは`moduleDependencies`で互換範囲を宣言する。
- app layout、page、route、業務APIはmoduleへ追加しない。

## 試験層

1. 純粋関数のunit test
2. package、責務、公開pathのcontract test
3. JSON Schemaとrepository-contained evidenceのcompliance test
4. `@nuxt/test-utils` fixtureによるSSR module test
5. playgroundのtypecheckとproduction build

```sh
pnpm dev:prepare
pnpm test
pnpm typecheck
pnpm build
pnpm compliance:verify
```

## ローカル成果物

module repositoryとconsumerのsource treeをpathで結合しません。

1. Wonderland rootで`./bin/nuxtjp-ui-package`を実行する。
2. scriptが`.artifacts/npm/`へ検証済みtarballを集約する。
3. scriptが対象consumerの`vendor/nuxtjp-ui-<version>.tgz`へ成果物を配備する。
4. consumerはrepo相対の`file:./vendor/nuxtjp-ui-<version>.tgz`だけを参照する。
5. frozen lockfileで導入し、各consumerのtypecheck、test、buildを行う。

依存lockfileを意図的に再生成する場合だけ、Wonderland rootで次を実行します。

```sh
./bin/nuxtjp-ui-package --refresh-locks
```

`.artifacts/npm/`とconsumerの`vendor/*.tgz`は一時成果物であり、Gitへ追加しません。

`pnpm pack`は`prepack`を通じてcompliance、test、typecheck、buildを再実行します。

成果物のdigestはstage directoryを作業directoryとして検証します。

```sh
# Wonderland rootで実行
(cd .artifacts/npm && sha256sum -c SHA256SUMS)
```

## 公開ゲート

1. exact lockfileから導入し、compliance、test、typecheck、production buildを完了する。
2. `pnpm pack --dry-run`で`dist`、license、README、Security方針、第三者通知だけが対象であることを確認する。
3. archiveに秘密、顧客Data、絶対Path、fixture、test、開発script、cache、logがないことを確認する。
4. trusted publishingまたは同等の短命Identityからexact versionとprovenanceを発行する。
5. registry上のarchive digestを独立して照合してからconsumer lockを更新する。

詳細な境界と脆弱性報告方法は[`SECURITY.md`](../SECURITY.md)を参照してください。

## Versioning

公開APIはpackage SemVerで管理します。0.xでも破壊的変更をrelease notesへ明記し、Nuxt互換性は
`meta.compatibility.nuxt`、Nuxt UI互換性は`moduleDependencies`で別々に検証します。

release前に、pack内容が`dist`と必須noticeへ限定され、秘密情報、fixture、内部script、
生成cacheが含まれないことを確認します。commit、tag、publishは明示的な承認後にだけ行います。
