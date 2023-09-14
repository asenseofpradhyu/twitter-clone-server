import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { prismaClientMain } from '../client/db';

export async function initServer(){
    const app = express();
    app.use(bodyParser.json());

    // prismaClientMain.user.create({
    //     data:{
    //         
    //     }
    // });

    const graphQLServer = new ApolloServer({
        typeDefs:` type Query { 
            sayHello: String
            sayMyName(name: String!):String
         } `,
        resolvers:{ Query:{
            sayHello: () => `Hello from GraphQL Server`,
            sayMyName:(parent:any, {name}:{name:string}) => `Hello ${name}`}  }
    });

    await graphQLServer.start();
    app.use("/graphql", expressMiddleware(graphQLServer));

    return app;
}