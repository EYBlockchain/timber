import logger from '../logger';

export function logRequest(req, res, next) {
  logger.debug(`Request: ${req.path} - ${JSON.stringify(req.body)}`);
  next();
}
