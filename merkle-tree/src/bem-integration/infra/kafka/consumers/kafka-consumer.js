import logger from '../../../../logger';
import { KafkaMessageProcessingError } from '../kafka-exceptions';
import { createKafkaClient } from "../kafka-client";
import fs from "fs"

export class KafkaConsumer{
    constructor(topic, groupId, sessionTimeout = 300000){
        this.topic = topic;
        this.groupId = groupId;
        this.sessionTimeout = sessionTimeout;
        this.started = false;
    }

    async start() {
        while(!this.started) {
            logger.info('Starting Kafka consumer...');
            try {
                this.kafka = await createKafkaClient();
                this.consumer = this.kafka.consumer({ 
                    groupId: this.groupId, 
                    isolationLevel: 'read_committed', 
                    sessionTimeout: this.sessionTimeout,
                });

                this.consumer.on('consumer.crash', async (payload) => {
                    logger.warn('Kafka Consumer crashed', payload);
                    if(!payload.restart) {
                        await this.disconnect();
                        await this.run();
                    }
                });

                await this.run();
            } catch (error) {
                logger.error('Failed to connect and consume from Kafka', JSON.stringify(error));
                await new Promise((resolve) => setTimeout(() => resolve(), 5000));
            }
        }
	}

    async run() {
        try {
            await this.consumer.connect();
            logger.info('Connected to Kafka');

            await this.consumer.subscribe({ topic: this.topic, fromBeginning: true });
            logger.info(`Subscribed to the topic ${this.topic}`);

            await this.consumer.run({
                eachBatchAutoResolve: false,
                autoCommit: false,
                eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale, commitOffsetsIfNecessary }) => {
                    for (const message of batch.messages) {
                        if (!isRunning() || isStale()) break;
                        try {
                            if (this.topic === batch.topic) {
                                const parsedMessage = JSON.parse(message.value.toString());
                                await this.handleIncomingMessage(parsedMessage);
                                await commitOffsetsIfNecessary({
                                    topics: [{
                                        topic: batch.topic,
                                        partitions: [{
                                            partition: batch.partition,
                                            offset: `${Number(message.offset) + 1}`
                                        }]
                                    }]
                                });
                                resolveOffset(message.offset);
                                await heartbeat();
                            }
                        } catch (error) {
                            logger.error(`Error processing message at offset ${message.offset} in partition ${batch.partition}`, error);
                            throw new KafkaMessageProcessingError(error);
                        }
                    }
                }
            });

            this.started = true;
        } catch (error) {
            logger.error('Error running Kafka consumer', error);
        }
    }

    async disconnect() {
        try {
            if (this.consumer) {
                await this.consumer.disconnect();
                this.started = false;
                logger.info('Disconnected from Kafka');
            }
        } catch (error) {
            logger.error('Error disconnecting from Kafka', error);
        }
    }
}