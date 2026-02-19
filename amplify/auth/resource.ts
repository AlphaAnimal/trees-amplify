import { defineAuth } from '@aws-amplify/backend';
import { defineFunction } from '@aws-amplify/backend';

/**
 * Lambda function to customize Cognito email messages
 * This function customizes the verification email to include Trees Lab branding
 */
const emailCustomizer = defineFunction({
  entry: './email-customizer.ts',
  timeoutSeconds: 10,
  memoryMB: 128,
});

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  triggers: {
    customMessage: emailCustomizer,
  },
});
