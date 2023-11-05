import Redis from "ioredis"

const redisClient = new Redis("redis://default:21630861f3d34d8e8cbe6573e439e369@us1-driven-sailfish-38200.upstash.io:38200");

export default redisClient;