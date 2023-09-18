import axios from "axios";
import { prismaClientMain } from "../../client/db";
import JWTService from "../../services/jwt";


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

    }
}

export const resolvers = {queries};