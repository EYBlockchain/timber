import { decode } from 'jsonwebtoken';

export default function verifySaasContext(req, res, next) {
  try {
    if (req.headers?.context) {
      const context = JSON.parse(req.headers.context);
      if (typeof context !== 'object' || Array.isArray(context)) {
        throw new Error('Context must be a JSON object');
      }
      if (!context.accountId) {
        throw new Error('Missing required field: accountId in context');
      }
      req.context = context;
      
    } else if (req.headers?.authorization) {
      const token = req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.slice(7).trim()
        : req.headers.authorization.trim();

      const decoded = decode(token);

      if (!decoded || typeof decoded !== 'object' || !decoded.custom_claims) {
        throw new Error('Invalid or missing custom_claims in token');
      }
      req.context = decoded.custom_claims;
    } 
  } catch (err) {
    console.warn(`Invalid context header: ${err.message}`);
  }

  next();
}
