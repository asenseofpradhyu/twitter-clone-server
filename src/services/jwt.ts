import { User } from "@prisma/client";
import { prismaClientMain } from "../client/db";
import JWT from "jsonwebtoken";
import { JWTUser } from "../interface";

const JWT_SECRET_KEY="Admin@123"
class JWTService{
    public static  generateJWTTokenForUser(user: User){
        const payload:JWTUser = {
            id:user?.id,
            email:user?.email
        }

        const token = JWT.sign(payload, JWT_SECRET_KEY);
        return token;
    }

    public static decodeToken(token:string){
        try {
            return JWT.verify(token, JWT_SECRET_KEY) as JWTUser;
        } catch (error) {
            return null;
        }
        
    }
}

export default JWTService;