import { prismaClientMain } from "../client/db";

export interface CreateTweetData {
    content: string;
    imageURL?:string;
    userID:string;
}

class TweetService{

    public static createTweet(data:CreateTweetData){
        return prismaClientMain.tweet.create({
            data:{
                content:data.content,
                imageURL:data.imageURL,
                tweetUser:{connect:{id:data.userID}}
                
            }
        });
    }

    public static getAllTweets(){
        return prismaClientMain.tweet.findMany({orderBy:{createdAt:'desc'}});
        }

}


export default TweetService;