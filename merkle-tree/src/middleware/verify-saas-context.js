import { decode } from 'jsonwebtoken';
import { redisClient } from '../bem-integration/infra/redis/redis-client';
import logger from "../logger";

const REDIS_DATA_STORE_KEY = 'store-data';

export default async function verifySaasContext(req, res, next) {
    const isEnabled = process.env.ENABLE_BLOCKCHAIN_EVENT_MANAGER === 'true';
    logger.debug(`Blockchain Event Manager Enabled: ${isEnabled}`);
    if (!isEnabled) return next();

    try {
        const context = extractContextFromHeaders(req);
        if (!context.accountId) {
            throw new Error('Missing required field "accountId" in context');
        }
        logger.info('Context extracted successfully');
        req.context = context;

        await storeContractMetadataInRedis(req.body, context);
        logger.info('Contract metadata stored successfully');
    } catch (error) {
        logger.error(`Invalid context header: ${error.message}`);
        throw new Error(`Invalid context header: ${error.message}`);
    }

    next();
}

function extractContextFromHeaders(req) {
    try {
        const { context, authorization } = req.headers || {};
        if (context) {
            const parsed = JSON.parse(context);
            if (typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Context must be a plain object');
            }
            logger.info('Context header parsed successfully');
            return parsed;
        }
        if (authorization) {
            const token = authorization.startsWith('Bearer ')
                ? authorization.slice(7).trim()
                : authorization.trim();

            const decoded = decode(token);
            if (!decoded || typeof decoded !== 'object' || !decoded.custom_claims) {
                throw new Error('Missing or invalid custom_claims in token');
            }

            logger.info('Authorization token decoded successfully');
            return decoded.custom_claims;
        }
    } catch (error) {
        logger.error(`Failed to extract context from headers: ${error.message}`);
        throw new Error(`Failed to extract context from headers: ${error.message}`);
    }
}


async function storeContractMetadataInRedis(body, context) {
    try {
        logger.debug('Storing contract metadata in Redis');
        const { contractId, contractName, contractAddress } = body || {};

        const dataToStore = {
            contractAddress,
            contractId,
            contractName,
            context,
        };

        const result = await redisClient.hset(
            REDIS_DATA_STORE_KEY,
            contractAddress,
            JSON.stringify(dataToStore)
        );
        if (![0, 1].includes(result)) {
            throw new Error(`Failed to store contract data in Redis: ${result}`);
        }
        logger.info(`Contract metadata stored in Redis for address: ${contractAddress}`);
    } catch (error) {
        logger.error(`Failed to store contract metadata in Redis: ${error.message}`);
        throw new Error(`Failed to store contract metadata in Redis: ${error.message}`);
    }
}
