import axios from "axios";
import { prismaClientMain } from "../../client/db";
import JWTService from "../../services/jwt";
import { GraphqlContext } from "../../interface";
import { User } from "@prisma/client";
import UserService from "../../services/user";
import redisClient from "../../client/redis";




const queries = {
    verifyGoogleToken:async(parent:any, {token}:{token:string}) => {
        const resultToken = await UserService.verifyGoogleAuthLogin(token);
        return resultToken;

    },

    getCurrentUser: async(parent:any, args:any, ctx:GraphqlContext) => {
        // console.log(ctx);
        const id = ctx.user?.id
        if(!id) return null;

        const user = await UserService.getUserByID(id);
        return user;
    },

    getUserByID : async(parent:any, {id}:{id:string}, ctx:GraphqlContext) => {
        const user = await UserService.getUserByID(id);
        return user;
    }
}

const extraUserTweetResolver = {
   User:{
     tweets:(parent:User) => prismaClientMain.tweet.findMany({where:{tweetUser:{id:parent.id}}}),
     followers:async (parent:User) => {

        const result = await prismaClientMain.follows.findMany({where:{following:{id:parent.id}},include:{ follower:true}});
        return result.map((el:any) => el.follower);
    },
     followings:async (parent:User) => {
        const result = await prismaClientMain.follows.findMany(
        {
            where:{follower:{id:parent.id}},
            include:{ following:true}
        });
        return result.map((el:any) => el.following);
    },
    recommendedUsers: async (parent: User, _: any, ctx: GraphqlContext) => {
      if (!ctx.user) return [];

      const cachedValue = await redisClient.get(`RECOMMENDED_USERS:${ctx.user.id}`);

      if(cachedValue) return JSON.parse(cachedValue);                                               

      const myFollowings = await prismaClientMain.follows.findMany({
        where: {
          follower: { id: ctx.user.id },
        },
        include: {
          following: {
            include: { followers: { include: { following: true } } },
          },
        },
      });

      const users: User[] = [];

      for (const followings of myFollowings) {
        for (const followingOfFollowedUser of followings.following.followers) {
          if (
            followingOfFollowedUser.following.id !== ctx.user.id &&
            myFollowings.findIndex(
              (e:any) => e?.followingId === followingOfFollowedUser.following.id
            ) < 0
          ) {
            users.push(followingOfFollowedUser.following);
          }
        }
      }

      await redisClient.set(`RECOMMENDED_USERS:${ctx.user.id}`, JSON.stringify(users));

      return users;
    },
   }
}

const mutations = {
    followUser:async(parent:any, {to}:{to:string}, ctx:GraphqlContext) => {
        if(!ctx.user || !ctx.user.id) throw new Error("Unauthenticated");
        await UserService.followUser(ctx.user.id, to);
        await redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`);
        return true;
},

unFollowUser:async(parent:any, {to}:{to:string}, ctx:GraphqlContext) => {
        if(!ctx.user || !ctx.user.id) throw new Error("Unauthenticated");
        await UserService.deleteFollow(ctx.user.id, to);
        await redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`);
        return true;
}

};

export const resolvers = {queries,extraUserTweetResolver, mutations};