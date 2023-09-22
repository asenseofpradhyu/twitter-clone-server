import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { prismaClientMain } from '../client/db';
import { User } from './user';
import { Tweet } from './tweet';
import { GraphqlContext } from '../interface';
import JWTService from '../services/jwt';

export async function initServer(){
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());

    const graphQLServer = new ApolloServer<GraphqlContext>({
        typeDefs:` 
        ${User.types}
        ${Tweet.types}
        type Query { 
            ${User.queries}
            ${Tweet.queries}
         } 
         type Mutation{
            ${Tweet.mutations}
         }
         `,
        resolvers:{ 
          Query:{
            ...User.resolvers.queries,
            ...Tweet.resolvers.queries
          },

          Mutation:{
            ...Tweet.resolvers.mutations
          },
          ...Tweet.resolvers.extraTweetUserResolver,
          ...User.resolvers.extraUserTweetResolver
    }
    });

    await graphQLServer.start();
    app.use("/graphql", expressMiddleware(graphQLServer, { context: async ({req, res}) => {
    // console.log(req.headers.authorization);
        return {
            user: req.headers.authorization ? JWTService.decodeToken(req.headers.authorization?.split(" ")[1]) : null
        }
    }}));

    return app;
}