# Using @nuxtjp/operations-console

Show credential readiness, network observations and control coverage in a consistent operations view.

## Before you start

The application supplies validated observations. Displaying a control result does not perform a network change.

## First steps

Run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

## How to assess the result

- Render reviewed readiness and topology documents.
- Use individual panels or the combined console.

A passing source-level check establishes only what that check observes. Keep missing configuration, unavailable services and unverified deployment paths visible.

## Continue reading

[Repository overview](../README.md)
