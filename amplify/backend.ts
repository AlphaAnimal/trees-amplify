import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { auth } from "./auth/resource";
import { customFunction } from "./custom-function/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  customFunction,
});

const customStack = backend.createStack("custom-resources");
const stackName = Stack.of(customStack).stackName;

const mediaBucket = backend.storage.resources.bucket;

new ssm.StringParameter(customStack, "MediaBucketNameParam", {
  parameterName: `/${stackName}/MediaBucketName`,
  stringValue: mediaBucket.bucketName,
});
