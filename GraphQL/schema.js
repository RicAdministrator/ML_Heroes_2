export const typeDefs = `#graphql
type Role {
  _id: ID!
  role: String!
  logo_url: String
  primary_function: String
  key_attributes: String
}
type Query {
  roles: [Role]
}
type Mutation {
  addRole(role: AddRoleInput!): Role
  deleteRole(_id: ID!): [Role]
  updateRole(_id: ID!, edits: AddRoleInput!): Role  
}
input AddRoleInput {
  role: String!
  logo_url: String
  primary_function: String
  key_attributes: String
}
`