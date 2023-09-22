import { Tweet } from "@prisma/client";
import { prismaClientMain } from "../../client/db";
import { GraphqlContext } from "../../interface";

interface CreateTweetData {
    content: string;
    imageURL?:string;
}

const queries = {
    getAllTweets: async() => await prismaClientMain.tweet.findMany({orderBy: { createdAt:"desc" } }),
}

const mutations = {
    createTweet: async (parent:any, {payload}:{payload:CreateTweetData}, ctx:GraphqlContext) => {

        if(!ctx.user) throw new Error("user not logged In");
        const tweet = await prismaClientMain.tweet.create({
            data:{
                content:payload.content,
                imageURL:payload.imageURL,
                tweetUser:{connect:{id:ctx.user?.id}},
            }
        })

        return tweet;
    }
}

const extraTweetUserResolver =  {
    Tweet:{
        tweetUser:(parent:Tweet) => prismaClientMain.user.findUnique({where: {id:parent.tweetID}}),
    }
}

export const resolvers = {mutations, extraTweetUserResolver,queries};