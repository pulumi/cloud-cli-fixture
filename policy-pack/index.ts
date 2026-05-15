import * as aws from "@pulumi/aws";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";

new PolicyPack("cloud-cli-fixture-pack", {
    policies: [
        {
            name: "s3-bucket-versioning-required",
            description: "S3 buckets must have a BucketVersioningV2 sibling with status=Enabled.",
            enforcementLevel: "advisory",
            validateResource: validateResourceOfType(aws.s3.BucketV2, (bucket, args, reportViolation) => {
                if (bucket.bucketPrefix?.includes("cloud-cli-fixture-bad")) {
                    reportViolation(`Bucket ${bucket.bucketPrefix} is the fixture violator — versioning missing.`);
                }
            }),
        },
        {
            name: "s3-bucket-encryption-required",
            description: "S3 buckets must have a BucketServerSideEncryptionConfigurationV2 sibling.",
            enforcementLevel: "advisory",
            validateResource: validateResourceOfType(aws.s3.BucketV2, (bucket, args, reportViolation) => {
                if (bucket.bucketPrefix?.includes("cloud-cli-fixture-bad")) {
                    reportViolation(`Bucket ${bucket.bucketPrefix} is the fixture violator — encryption missing.`);
                }
            }),
        },
    ],
});
