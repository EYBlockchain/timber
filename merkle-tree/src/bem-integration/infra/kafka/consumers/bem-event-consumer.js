import { KafkaConsumer } from "./kafka-consumer";
import { KafkaMessageProcessingError } from "../kafka-exceptions";
import logger from "../../../../logger";
import { LeafService, MetadataService } from '../../../../db/service';
import { redisClient } from "../../redis/redis-client";
import config from 'config';
import adminDbConnection from '../../../../db/common/adminDbConnection';
import DB from '../../../../db/mongodb/db';

const { admin } = config.get('mongo');
const REDIS_DATA_STORE_KEY = 'store-data';

export class BemConsumer extends KafkaConsumer {
    constructor() {
        super(
            `${process.env.BEM_KAFKA_TOPIC}${process.env.CALLBACK_TOPIC_SUFFIX}`,
            process.env.BEM_KAFKA_GROUP_ID,
            +process.env.BEM_KAFKA_SESSION_TIMEOUT
        );
    }

    async handleIncomingMessage(parsedMessage) {
        const { eventLog } = parsedMessage;
        const blockNumber = Number(parsedMessage.blockNumber || 0);
        const contractAddress = eventLog.address;
        const eventName = eventLog.name;

        logger.info(`Processing message for contract: ${contractAddress}`);

        try {
            const contractDetails = await this.getContractMetadataFromRedis(contractAddress);
            if (!contractDetails) {
                logger.warn(`No contract details found in Redis for ${contractAddress}`);
                return;
            }

            const db = await this.getDbInstanceForContract(contractDetails);
            logger.info(`DB instance initialized for contract: ${contractDetails.contractName}`);

            switch (eventName) {
                case 'NewLeaves':
                    await this.handleNewLeavesEvent(eventLog, blockNumber, db);
                    break;
                case 'NewLeaf':
                    await this.handleNewLeafEvent(eventLog, blockNumber, db);
                    break;
                default:
                    logger.warn(`Unhandled event name: ${eventName}`);
            }

            logger.info(`Finished processing event: ${eventName} for contract: ${contractAddress}`);
        } catch (error) {
            logger.error('Error in processing Kafka message', error);
            throw new KafkaMessageProcessingError(error);
        }
    }


    async handleNewLeavesEvent(eventLog, blockNumber, db) {
        try {
            logger.debug(`Handling 'NewLeaves': inserting leaves into Merkle tree`);
            const eventInstance = this.buildEventPayload(eventLog);
            const { minLeafIndex, leafValues } = eventInstance;

            const metadataService = new MetadataService(db);
            const { treeHeight } = await metadataService.getTreeHeight();

            const leaves = leafValues.map((leafValue, index) => ({
                value: leafValue.toString(),
                leafIndex: Number(minLeafIndex) + index,
                blockNumber
            }));

            const leafService = new LeafService(db);
            leafService.insertLeaves(treeHeight, leaves);
            logger.info(`Inserted ${leaves.length} leaves into DB`);
        } catch (error) {
            logger.error(`Error in handling 'NewLeaves': `, error);
            throw new Error(`Error in handling 'NewLeaves': `, error);
        }

    }


    async handleNewLeafEvent(eventLog, blockNumber, db) {
        try {
            logger.debug(`Handling 'NewLeaf': inserting leaf into Merkle tree`);
            const eventInstance = this.buildEventPayload(eventLog);
            let { leafIndex, leafValue } = eventInstance;

            const metadataService = new MetadataService(db);
            const { treeHeight } = await metadataService.getTreeHeight();

            leafIndex = Number(eventInstance.leafIndex);
            const leaf = {
                value: leafValue.toString(),
                leafIndex,
                blockNumber
            };

            const leafService = new LeafService(db);
            leafService.insertLeaf(treeHeight, leaf);
            logger.info(`Inserted single leaf at index ${leafIndex} into DB`);
        } catch (error) {
            logger.error(`Error in handling 'NewLeaf': `, error);
            throw new Error(`Error handling 'NewLeaf': `, error);
        }

    }


    buildEventPayload(eventLog) {
        const eventName = eventLog.name;
        const eventConfig = config.contracts['default'].events[eventName];

        if (!eventConfig) {
            throw new Error(`No config found for event ${eventName}`);
        }

        const payload = {};
        eventConfig.parameters.forEach(param => {
            payload[param] = eventLog.returnValues[param];
        });

        logger.debug(`Built event payload for ${eventName}: ${JSON.stringify(payload)}`);
        return payload;
    }


    async getDbInstanceForContract({ contractId, contractName }) {
        try {
            logger.debug(`Creating DB instance for contractId: ${contractId}, contractName: ${contractName}`);
            const treeId = '';
            return new DB(adminDbConnection, admin, contractName, treeId, contractId);
        } catch (error) {
            logger.error(`Failed to create DB instance for contractId: ${contractId}. Error: ${error.message}`);
            throw new Error(`Failed to create DB instance for contractId: ${contractId}. Error: ${error.message}`);
        }
    }


    async getContractMetadataFromRedis(contractAddress) {
        try {
            logger.debug(`Fetching contract metadata from Redis for address: ${contractAddress}`);
            const data = await redisClient.hget(REDIS_DATA_STORE_KEY, contractAddress);
            if (!data) return null;

            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            logger.info('Fetched contract metadata from from Redis: ');
            return parsed;
        } catch (e) {
            logger.warn(`Invalid Redis data for ${contractAddress}`);
            return null;
        }
    }
}
