# Security boundary

[日本語](../../SECURITY.md)

`@nuxtjp/operations-console` is a read-only presentation package. It has no
network discovery, credential acquisition, authorization, policy execution, or
control-plane capability.

It accepts only:

- `crowsi://credentials/status/v1`
- `crowsi://network/observations/v1`
- `crowsi://network/control-receipts/v1`
- `crowsi://network/control-coverage-snapshot/v2`

Objects reject unknown fields and require `external_actions: false`.
Credential documents additionally require `contains_secret_values: false`.
The absence of a dedicated secret field is data minimization, not content
classification; authenticate the producer and enforce metadata-only generation
before the browser boundary.

Treat a failed guard as a trust-boundary failure. Do not partially render,
coerce, or log the rejected document.

- Keep secret material behind the credential broker.
- Bind every dry-run receipt to its originating decision and target.
- Apply byte-size transport limits; guards cap credential and observation
  documents at 1,024 records, control decisions and receipts at 256 records,
  and finding lists at 64 codes.
- Never interpret `allowed-dry-run` as an executed change.
- Never use projections older than five minutes for a `ready` decision.
- Never present stale coverage as `controlled` or isolation-ready.
- Coverage findings are read-only; do not add quarantine or restore controls.
- Keep raw projections out of analytics, browser persistence, and error logs.
- Consume pinned package artifacts instead of source-tree path dependencies.

Samples contain synthetic identifiers and no credential or working endpoint.
Report vulnerabilities privately and never include a real credential.
