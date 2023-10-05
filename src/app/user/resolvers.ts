import axios from "axios";
import { prismaClientMain } from "../../client/db";
import JWTService from "../../services/jwt";
import { GraphqlContext } from "../../interface";
import { User } from "@prisma/client";


interface googleOAuthResponse {
  iss?: string;
  nbf?: string;
  aud?: string;
  sub?: string;
  email: string;
  email_verified?: string;
  azp?: string;
  name?: string;
  picture?: string;
  given_name: string;
  family_name?: string;
  iat?: string;
  exp?: string;
  jti?: string;
  alg?: string;
  kid?: string;
  typ?: string;
}

const queries = {
    verifyGoogleToken:async(parent:any, {token}:{token:string}) => {
        const googleToken = token;
        const googleOAuthURL = new URL('https://oauth2.googleapis.com/tokeninfo');
        googleOAuthURL.searchParams.set('id_token', googleToken);

        const {data} = await axios.get<googleOAuthResponse>(googleOAuthURL.toString(), {
            responseType:'json'
        });

        console.log(data)

        const isUserExist = await prismaClientMain.user.findUnique({ where: {email: data.email}});

        if(!isUserExist){
            await prismaClientMain.user.create({
                data:{
                    email: data.email,
                    firstName: data.given_name,
                    lastName: data.family_name,
                    profileImageURl: data.picture
                }
            })
        }



        const userInDb = await prismaClientMain.user.findUnique({ where: {email: data.email}});
        if(!userInDb) throw new Error("User with Email Not Found"); 
        const userToken  = await JWTService.generateJWTTokenForUser(userInDb);

        return userToken;

    },

    getCurrentUser: async(parent:any, args:any, ctx:GraphqlContext) => {
        // console.log(ctx);
        const id = ctx.user?.id
        if(!id) return null;

        const user = await prismaClientMain.user.findUnique({where:{id}});
        return user;
    },

    getUserByID : async(parent:any, {id}:{id:string}, ctx:GraphqlContext) => {
        const user = await prismaClientMain.user.findUnique({where:{id}});
        return user;
    }
}

const extraUserTweetResolver = {
   User:{
     tweets:(parent:User) => prismaClientMain.tweet.findMany({where:{tweetUser:{id:parent.id}}}),
   }
}

export const resolvers = {queries,extraUserTweetResolver};