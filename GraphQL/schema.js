export const typeDefs = `#graphql
type Role {
  _id: ID!
  role: String!
  logo_url: String
  primary_function: String
  key_attributes: String
}
type HeroRole {
  _id: ID!
  hero_id: ID!
  role_id: ID!
  role: Role!
}
type Hero {
  _id: ID!
  name: String!
  image_url: String
  description: String
  hero_roles: [HeroRole!]!
}
type Query {
  roles: [Role]
  heroRoles: [HeroRole]
  heroRolesByHeroId(heroId: ID!): [HeroRole]
  heroRolesByRoleId(roleId: ID!): [HeroRole]
  heroes: [Hero]
}
type Mutation {
  addRole(role: AddRoleInput!): Role
  deleteRole(_id: ID!): [Role]
  updateRole(_id: ID!, edits: AddRoleInput!): Role  
  addHero(hero: AddHeroInput): Hero
  deleteHero(_id: ID!): [Hero]
  updateHero(_id: ID! edits: AddHeroInput): Hero
  addHeroRole(heroRole: AddHeroRoleInput): [HeroRole!]!
  deleteHeroRoles(hero_id: ID!): [HeroRole]
}
input AddRoleInput {
  role: String!
  logo_url: String
  primary_function: String
  key_attributes: String
}
input AddHeroInput {
  name: String!
  image_url: String
  description: String
}
input AddHeroRoleInput{
  hero_id: ID!
  role_id: [ID!]!
}
`