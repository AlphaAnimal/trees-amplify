import { defineFunction } from '@aws-amplify/backend';

/**
 * Define and configure your custom function resource
 * This will serve as a proxy to your Flask service
 */
export const customFunction = defineFunction({
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
});
