const Bull = require('bull');
const { REDIS_HOST, REDIS_PORT } = process.env;

function setupBullQueue(queueName) {
  return new Bull(queueName, {
    redis: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
    settings: {
      retryStrategy: (attempts) => Math.min(attempts * 1000, 30000),
    },
  });
}

module.exports = setupBullQueue;

