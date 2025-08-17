/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTree = /* GraphQL */ `
  query GetTree($id: ID!) {
    getTree(id: $id) {
      id
      name
      description
      image
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listTrees = /* GraphQL */ `
  query ListTrees(
    $filter: ModelTreeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTrees(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        image
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
