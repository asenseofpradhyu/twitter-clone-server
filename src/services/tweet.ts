import { prismaClientMain } from "../client/db";
import redisClient from "../client/redis";

export interface CreateTweetData {
    content: string;
    imageURL?:string;
    userID:string;
}

class TweetService{

    public static async createTweet(data:CreateTweetData){

        const rateLimitFlag = await redisClient.get("RATE_LIMIT:TWEET:${data.userID}");
        if(rateLimitFlag) throw new Error("Too many request. Please try after sometime");

        const tweetCreated = prismaClientMain.tweet.create({
            data:{
                content:data.content,
                imageURL:data.imageURL,
                tweetUser:{connect:{id:data.userID}}
                
            }
        });
        await redisClient.setex(`RATE_LIMIT:TWEET:${data.userID}`, 10, 1);
        await redisClient.del("ALL_TWEETS");
        return tweetCreated;
    }

    public static async getAllTweets(){
        const cacheTweets = await redisClient.get("ALL_TWEETS");

        if(cacheTweets) return JSON.parse(cacheTweets);

        const allTweets= prismaClientMain.tweet.findMany({orderBy:{createdAt:'desc'}});
        await redisClient.set("ALL_TWEETS", JSON.stringify(allTweets));
        return allTweets;
        }

}


export default TweetService;