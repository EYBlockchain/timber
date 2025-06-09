import Redis from 'ioredis';
import { RedisConnectionError } from './redis-exceptions';
import logger from "../../../logger";

const APP_PREFIX = (process.env.REDIS_ENV_PREFIX || '') + 'ocm-timber:';

export function createRedisClient() {
    try {
        const redisConfig = {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            keyPrefix: APP_PREFIX,
            maxRetriesPerRequest: null
        };
        if (process.env.NODE_ENV !== 'local' && process.env.NODE_ENV !== 'test') {
            redisConfig.password = process.env.REDIS_PASSWORD;
            redisConfig.tls = {
                servername: process.env.REDIS_HOST,
            };
        }
        
        return new Redis(redisConfig);
    } catch (error) {
        logger.error('Failed while creating redis client', error);
        throw new RedisConnectionError(error);
    }
}

export const redisClient = createRedisClient();
