import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

export interface AmplifyTreeInput {
  name: string
}

export interface AmplifyTree {
  id: string
  name: string | null
  createdAt: string
  updatedAt: string
  owner: string | null
}

export const amplifyTreesApi = {
  /** Create tree metadata record in Amplify DynamoDB. Returns the new tree (including its id). */
  create: async (input: AmplifyTreeInput): Promise<AmplifyTree> => {
    const { data, errors } = await client.models.Tree.create(input)
    if (errors?.length) {
      throw new Error(errors.map((e) => e.message).join(', '))
    }
    if (!data) throw new Error('No data returned from tree creation')
    return data as unknown as AmplifyTree
  },

  /** Delete tree metadata from Amplify DynamoDB. */
  delete: async (id: string): Promise<void> => {
    const { errors } = await client.models.Tree.delete({ id })
    if (errors?.length) {
      throw new Error(errors.map((e) => e.message).join(', '))
    }
  },
}

