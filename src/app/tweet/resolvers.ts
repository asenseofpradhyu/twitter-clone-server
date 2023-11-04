import { Tweet } from "@prisma/client";
import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import { prismaClientMain } from "../../client/db";
import { GraphqlContext } from "../../interface";
import UserService from "../../services/user";
import TweetService, { CreateTweetData } from "../../services/tweet";




const s3Client = new S3Client({
    region:process.env.AWS_DEFAULT_REGION
});

const queries = {
    getAllTweets: async() => await TweetService.getAllTweets(),
    getSignedURLForTweet: async(parent:any, {imageName, imageType}:{imageName:string, imageType:string}, ctx:GraphqlContext) => {
        console.log(ctx.user?.id);
        if(!ctx.user || !ctx.user.id) throw new Error("Unauthenticated");
        const allowdImageTypes = ['image/jpg', 'image/jpeg', 'image/png'];
        if(!allowdImageTypes.includes(imageType)) throw new Error("File Not Supported");

        const putObjectCommand = new PutObjectCommand({
            Bucket:process.env.AWS_S3_BUCKET_ID,
            Key:`uploads/${ctx.user.id}/tweetsImage/${imageName}-${Date.now()}`
        });

        const sigedURL = await getSignedUrl(s3Client, putObjectCommand, {expiresIn:600});
        return sigedURL;
    } 
}

const mutations = {
    createTweet: async (parent:any, {payload}:{payload:CreateTweetData}, ctx:GraphqlContext) => {

        if(!ctx.user) throw new Error("user not logged In");
        const tweet = await TweetService.createTweet({
            ...payload,
            userID:ctx.user.id
        });

        return tweet;
    }
}

const extraTweetUserResolver =  {
    Tweet:{
        tweetUser:(parent:Tweet) => UserService.getUserByID(parent.tweetUserID)
    }
}

export const resolvers = {mutations, extraTweetUserResolver,queries};