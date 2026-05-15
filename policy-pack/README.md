# cloud-cli-fixture-pack

Tiny advisory policy pack that flags the intentionally-non-compliant S3 bucket
in the parent fixture program. Used to give `pulumi policy issue *` and
`pulumi policy compliance list` something to query during cloud-ready CLI
testing.

Two rules, both `advisory` (so updates aren't blocked):

- `s3-bucket-versioning-required`
- `s3-bucket-encryption-required`

Both fire against any `aws:s3/bucketV2:BucketV2` whose `bucketPrefix`
contains `cloud-cli-fixture-bad` — that's the `violator` bucket the parent
program creates.

## Publishing

```sh
npm install
pulumi policy publish pat-staging-org   # or any org
```

This pack is currently attached to the `cloud-cli-fixture-group` policy
group on `api.pulumi-staging.io`, which itself is applied to the
`pat-staging-org/cloud-cli-fixture/dev` stack.

## Why it lives here

The pack and the resources it flags share a single fixture story; keeping
them in the same repo makes the "what trips what" relationship obvious.
