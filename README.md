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

## Stack configuration

The stack expects AWS credentials via the ESC environment
`cloud-cli-fixture/env` (configured separately on staging — see the
`2026-05-15-cloud-cli-staging-fixtures.md` design doc on md.pgavlin.sh).
Add it to the stack with:

```
pulumi config env add cloud-cli-fixture/env
```

## Pulumi Deployments

The stack is wired up to Pulumi Deployments so that:

- Pushes to `main` trigger a `pulumi up`.
- The Deployments runner uses the agent pool `cloud-cli-fixture-pool` on
  staging.
- A scheduled refresh keeps the stack fresh (drift entries get generated
  if the live state diverges).

Pulumi Cloud picks this configuration up from the stack's settings page on
staging.
