import logger from "../../../logger";
import { Kafka } from 'kafkajs';
import { KafkaConnectionError } from './kafka-exceptions';
  
const ssl = {
    rejectUnauthorized: true,
    ca: process.env.BEM_KAFKA_CA_CERT,
    key: process.env.BEM_KAFKA_ACCESS_KEY,
    cert: process.env.BEM_KAFKA_ACCESS_CERT,
};
  
let kafkaInstance;
  
export async function createKafkaClient() {
    if (!kafkaInstance) {
        try {
            kafkaInstance = new Kafka({
              clientId: process.env.BEM_KAFKA_CLIENT_ID,
              brokers: JSON.parse(process.env.BEM_KAFKA_BROKERS) || ['kafka:9093'],
              authenticationTimeout: +process.env.BEM_KAFKA_AUTH_TIMEOUT || 10000,
              connectionTimeout: +process.env.BEM_KAFKA_CONNECTION_TIMEOUT || 10000,
              ssl: process.env.KAFKA_IS_SELF_HOSTED === 'true' ? false : ssl,
              retry: {
                initialRetryTime: 500,
                multiplier: 2,
                maxRetryTime: 20000,
                restartOnFailure: async (error) => {
                  logger.error('createKafkaClient restartOnFailure failed with error', error);
                  return true;
                },
              },
              logCreator: loggerBridge
            });
        } catch (error) {
            logger.error('Failed while creating Kafka client', error);
            throw new KafkaConnectionError(error);
        }
    }
    return kafkaInstance;
}

function loggerBridge(logLevel) {
  return ({ namespace, level, label, log }) => {
      const { message, ...extra } = log;
      switch(level) {
        case logLevel.ERROR:
        case logLevel.NOTHING:
            logger.error(message, extra);
            break;
        case logLevel.WARN:
            logger.warn(message, extra);
            break;
        case logLevel.INFO:
            logger.info(message, extra);
            break;
        case logLevel.DEBUG:
            logger.debug(message, extra);
            break;
        default:
            logger.info(message, extra);
    }
  }
}

export default {
    createKafkaClient,
};
