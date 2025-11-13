import Redis from "ioredis";

const redisHost = process.env.REDIS_HOST || "10.129.95.235";
const redisPort = Number(process.env.REDIS_PORT || 6379);

console.log("Using Redis host/port:", redisHost, redisPort);

const redis = new Redis({
   host: redisHost,
   port: redisPort,
});

redis.on("connect", () => {
   console.log("Connected to Redis server");
});

redis.on("error", (err) => {
   console.error("Redis connection error:", err);
});

export default redis;