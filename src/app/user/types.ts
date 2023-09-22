export const types = `#graphql

type User {
    id: ID!
    firstName: String!
    lastName: String
    email: String!
    profileImageURl: String

    tweets:[Tweet]
}
`;