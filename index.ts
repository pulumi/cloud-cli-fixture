import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

// Unique suffix so re-creates after `pulumi destroy` don't collide with
// AWS's eventual-consistency global namespace (especially for S3 buckets).
const suffix = new random.RandomString("suffix", {
    length: 6,
    special: false,
    upper: false,
}).result;

// SSM parameter — cheap, no global namespace.
const ssm = new aws.ssm.Parameter("fixture-parameter", {
    type: "String",
    value: "cloud-cli-fixture",
});

// Compliant S3 bucket: versioning + server-side encryption + public access block.
const compliant = new aws.s3.BucketV2("compliant", {
    bucketPrefix: pulumi.interpolate`cloud-cli-fixture-ok-${suffix}-`,
    forceDestroy: true,
});

new aws.s3.BucketVersioningV2("compliant-versioning", {
    bucket: compliant.id,
    versioningConfiguration: { status: "Enabled" },
});

new aws.s3.BucketServerSideEncryptionConfigurationV2("compliant-sse", {
    bucket: compliant.id,
    rules: [{
        applyServerSideEncryptionByDefault: { sseAlgorithm: "AES256" },
    }],
});

new aws.s3.BucketPublicAccessBlock("compliant-pab", {
    bucket: compliant.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
});

// Non-compliant S3 bucket: no versioning, no encryption.
// Trips AWS Guard's s3-bucket-versioning-enabled and s3-no-public-read rules
// (or whatever pack is attached to cloud-cli-fixture-group). Public-access-block
// is still on at the bucket level so this stays safe in aws-dev-sandbox.
const violator = new aws.s3.BucketV2("violator", {
    bucketPrefix: pulumi.interpolate`cloud-cli-fixture-bad-${suffix}-`,
    forceDestroy: true,
});

new aws.s3.BucketPublicAccessBlock("violator-pab", {
    bucket: violator.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
});

// IAM role with a narrow read-only inline policy. Gives Insights something
// non-S3 to discover.
const role = new aws.iam.Role("fixture-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: { Service: "ec2.amazonaws.com" },
            Action: "sts:AssumeRole",
        }],
    }),
});

new aws.iam.RolePolicy("fixture-role-policy", {
    role: role.id,
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Action: ["s3:ListBucket", "s3:GetObject"],
            Resource: "*",
        }],
    }),
});

export const compliantBucket = compliant.id;
export const violatorBucket = violator.id;
export const parameter = ssm.name;
export const roleArn = role.arn;
