import { User } from "@prisma/client";
import { prismaClientMain } from "../client/db";
import JWT from "jsonwebtoken";

const JWT_SECRET_KEY="Admin@123"
class JWTService{
    public static  generateJWTTokenForUser(user: User){
        const payload = {
            id:user?.id,
            email:user?.email
        }

        const token = JWT.sign(payload, JWT_SECRET_KEY);
         return token;
    }
}

export default JWTService;