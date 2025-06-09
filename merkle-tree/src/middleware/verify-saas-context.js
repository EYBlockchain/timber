import { decode } from 'jsonwebtoken';
import { redisClient } from '../bem-integration/infra/redis/redis-client'

const REDIS_DATA_STORE_KEY = 'store-data';

export default async function verifySaasContext(req, res, next) {
  try {
    if (req.headers?.context && process.env.ENABLE_BLOCKCHAIN_EVENT_MANAGER === 'true') {
      const context = JSON.parse(req.headers.context);
      if (typeof context !== 'object' || Array.isArray(context)) {
        throw new Error('Context must be a JSON object');
      }
      if (!context.accountId) {
        throw new Error('Missing required field: accountId in context');
      }
      req.context = context;
      
    } else if (req.headers?.authorization && process.env.ENABLE_BLOCKCHAIN_EVENT_MANAGER === 'true') {
      const token = req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.slice(7).trim()
        : req.headers.authorization.trim();

      const decoded = decode(token);

      if (!decoded || typeof decoded !== 'object' || !decoded.custom_claims) {
        throw new Error('Invalid or missing custom_claims in token');
      }
      req.context = decoded.custom_claims;
    } 
    if (process.env.ENABLE_BLOCKCHAIN_EVENT_MANAGER === 'true') {
      const { contractId, contractName, contractAddress } = req.body;

      const data = {
        contractAddress,
        contractId,
        contractName,
        context: req.context
      };

      await redisClient.hset(REDIS_DATA_STORE_KEY, contractAddress, JSON.stringify(data));
    }
  } catch (err) {
    console.warn(`Invalid context header: ${err.message}`);
  }

  next();
}
