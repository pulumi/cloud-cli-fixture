# cloud-cli-fixture

Long-lived fixture stack for exercising Pulumi Cloud CLI commands against
`api.pulumi-staging.io`. Driven by Pulumi Deployments — when the Deployments
runner picks up a push to this repo, it runs `pulumi up` against the
configured stack, generating the activity the cloud-ready CLI commands query
(stack updates, deployment history, Insights resources, and once a policy
pack is published and attached, policy issues).

## What it creates

- An SSM parameter (`fixture-parameter`).
- A compliant S3 bucket with versioning, encryption, and public-access-block.
- A non-compliant S3 bucket without versioning or encryption (trips the
  `s3-bucket-versioning-enabled` and `s3-no-public-read` rules in AWS Guard
  or any equivalent pack attached to `cloud-cli-fixture-group`).
- An IAM role with a narrow read-only inline policy.

All resources are tiny and safe in `aws-dev-sandbox` (account `616138583583`).
Re-running `pulumi up` is idempotent; `pulumi destroy` cleans everything up.

## Repository layout

- `./` — the Pulumi program above.
- `policy-pack/` — companion policy pack (`cloud-cli-fixture-pack`) that flags
  the non-compliant bucket. Published with `pulumi policy publish`; see its
  [README](policy-pack/README.md).

## Stack configuration

The stack expects AWS credentials via the ESC environment
`cloud-cli-fixture/env` (configured separately on staging — see the
`2026-05-15-cloud-cli-staging-fixtures.md` design doc on md.pgavlin.sh).
Add it to the stack with:

```
pulumi config env add cloud-cli-fixture/env
```

## Pulumi Deployments

The stack runs on Pulumi-hosted Deployments. Push-triggered deploys are
currently disabled due to a staging GitHub-App integration bug; a daily
drift-detect schedule (09:00 UTC, auto-remediate) keeps the deployment
history and drift entries fresh.

Pulumi Cloud picks this configuration up from the stack's settings page on
staging.
