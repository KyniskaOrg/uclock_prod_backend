const setupBullQueue = require("../config/bull.js");
const { redisConfig } = require("../config/redis.js");
const sendMessageJob = require("../jobs/sendMessageJob.js");

const messageQueue = new setupBullQueue("messageQueue", {
  redis: redisConfig,
  settings: {
    // Configure retry options
    maxStalledCount: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // Delay in milliseconds
    },
  },
});

// Add job to the queue
const enqueueMessageJobs = async (phoneNumber) => {
  await messageQueue.add(
    { phoneNumber },
    {
      attempts: 5, // Number of retry attempts
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );
};


// Process the job
messageQueue.process(sendMessageJob);

module.exports = { messageQueue, enqueueMessageJobs };