const { createClient } = require("redis");
require("dotenv").config();

let redisClient = null;
let redisReady = false;

const connectRedis = async () => {
  const hasRedisUrl = Boolean(process.env.REDIS_URL);
  const hasRedisHost = Boolean(process.env.REDIS_HOST);

  if (!hasRedisUrl && !hasRedisHost) {
    console.warn("REDIS_URL not set. Token blacklist will run in memory-free fallback mode.");
    return null;
  }

  redisClient = createClient(
    hasRedisUrl
      ? { url: process.env.REDIS_URL }
      : {
          username: process.env.REDIS_USERNAME || process.env.REDIS_NAME || undefined,
          password: process.env.REDIS_PASSWORD || undefined,
          socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT || 6379),
          },
        }
  );

  redisClient.on("error", (error) => {
    redisReady = false;
    console.warn("Redis connection error:", error.message);
  });

  await redisClient.connect();
  redisReady = true;
  console.log("Redis connected");
  return redisClient;
};

const getRedis = () => (redisReady ? redisClient : null);

module.exports = { connectRedis, getRedis };
