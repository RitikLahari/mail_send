import { createClient } from 'redis';

let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://default:X8y4rZjMDkeKA9vhjUzeVNWSDXQ2sxzA@redis-14321.c100.us-east-1-4.ec2.redns.redis-cloud.com:14321'
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }
  
  return redisClient;
};

export default getRedisClient; 