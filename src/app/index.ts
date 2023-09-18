import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { prismaClientMain } from '../client/db';
import { User } from './user';

export async function initServer(){
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());

    const graphQLServer = new ApolloServer({
        typeDefs:` 
        ${User.types}
        type Query { 
            ${User.queries}
         } `,
        resolvers:{ Query:{
            ...User.resolvers.queries
        }}
    });

    await graphQLServer.start();
    app.use("/graphql", expressMiddleware(graphQLServer));

    return app;
}