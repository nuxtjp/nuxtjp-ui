# Security policy

## Reporting

Use GitHub private vulnerability reporting from the repository **Security** tab. If it is unavailable, use a private organization contact. Do not place an exploit, credential, personal information, or undisclosed vulnerability in a public issue.

Include the affected version or commit, a minimal reproduction, expected boundary, impact, prerequisites, and a safe reporter contact.

## Supported versions

Before 1.0, security fixes apply to the latest published minor version. Consumers should pin exact package and lockfile versions, review release notes, and rebuild through the approved package workflow.

## Layer boundary

This Layer does not implement authentication, authorization, secret storage, external requests, or privileged operations. Consumers retain:

- authorization before rendering or mutation;
- error and reason-code sanitization;
- CSRF and session controls;
- audit and incident handling;
- prevention of secret or customer data disclosure to the browser.

Moving one of these responsibilities into the Layer requires a security and architecture review.

## Automated access

The upstream checker permits only fixed HTTPS official hosts, validates every redirect, and limits time and response size. Workflows receive `contents: read` and never update locks, dependencies, implementation, or compliance status.

Local package artifacts are generated in Wonderland root `.artifacts/npm/` and copied into each consumer's `vendor/`. Consumers must not execute or import a temporary stage or another repository's source tree.

## Publication gate

Before publishing, maintainers must:

- run compliance, test, typecheck, and build with the exact lockfile;
- inspect `pnpm pack --dry-run` and keep the package `files` allow-list minimal;
- confirm the archive contains no credentials, customer data, private routes, logs, or local paths;
- verify license and primary-source notices and review every upstream change;
- publish an exact version with npm provenance through trusted publishing or another short-lived identity;
- verify the registry archive digest before consumers replace a local tarball;
- keep release approval separate from package build execution.

Long-lived npm tokens must not be stored in the repository, package archive, local `vendor/`, or browser-accessible configuration. A provenance statement identifies the build but does not replace code review, archive inspection, or digest verification.
