import { PrismaClient } from '@prisma/client';

export const prismaClientMain = new PrismaClient({log:['query']});