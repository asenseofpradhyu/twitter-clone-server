import axios from "axios";
import { prismaClientMain } from "../client/db";
import JWTService from "./jwt";

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

class UserService{
    public static async verifyGoogleAuthLogin(token:string){

        const googleToken = token;
        const googleOAuthURL = new URL('https://oauth2.googleapis.com/tokeninfo');
        googleOAuthURL.searchParams.set('id_token', googleToken);

        const {data} = await axios.get<googleOAuthResponse>(googleOAuthURL.toString(), {
            responseType:'json'
        });

        console.log(`Data: ${data}`);

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

    public static async getUserByID(id:string){
        return prismaClientMain.user.findUnique({where:{id}});
    }

    public static followUser(from:string, to:string){
        return prismaClientMain.follows.create({
            data:{
                follower:{connect:{ id: from}},
                following:{connect:{ id: to}}
            },
        });
    }

    public static deleteFollow(from:string, to:string){
        return prismaClientMain.follows.delete({
            where: { followerId_followingId:{followerId:from, followingId:to} }
        });
    }
}

export default UserService;