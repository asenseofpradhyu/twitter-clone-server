export const types = `#graphql


    input CreateTweetData {
        content: String!
        imageURL: String
    }

    type Tweet{
        tweetID: ID!
        content:String!
        imageURL:String

        tweetUser: User

    }

`;