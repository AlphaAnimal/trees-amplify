import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Verify your Trees Lab account',
      verificationEmailBody: (createCode) => {
        const code = createCode();
        return `
Welcome to Trees Lab!

The verification code to your new account is ${code}.

This code will expire in 15 minutes.

If you didn't create an account with Trees Lab, please ignore this email.

Thank you,
The Trees Lab Team
        `.trim();
      },
    },
  },
});
