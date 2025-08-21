const redis = require("redis");
const { messageQueue } = require("../queues/messageQueue.js");
const { startMessageScheduler } = require("../schedulers/scheduler.js");
const { REDIS_HOST, REDIS_PORT } = process.env;

function createRedisClient() {
  const redisClient = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
  });

  redisClient.on("error", (err) => {
    console.error("Redis error:", err);
  });

  redisClient
    .connect()
    .then(() => {
      console.info("Connected to Redis");
      // Setup Message Bull queue
      messageQueue;
      // Start the  message scheduler
      startMessageScheduler();
    })
    .catch((err) => {
      console.log("Error connecting to Redis", err);
    });
}

module.exports = { createRedisClient };
