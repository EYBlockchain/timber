import { KafkaConsumer } from "./kafka-consumer";
import { KafkaMessageProcessingError } from "../kafka-exceptions";
import logger from "../../../../logger";

export class BemConsumer extends KafkaConsumer{

    constructor(){
        super(
            `${process.env.BEM_KAFKA_TOPIC}${process.env.CALLBACK_TOPIC_SUFFIX}`,
            process.env.BEM_KAFKA_GROUP_ID, 
            +process.env.BEM_KAFKA_SESSION_TIMEOUT
        );
    }

    async handleIncomingMessage(parsedMessage) {
        logger.info(`Processing message for contract with address ${parsedMessage.eventLog.address}`);
        try {
            console.log('DATTATRAY Here is the messages -', parsedMessage)
            // DATTATRAY Placeholder for processing and storing event in db
        } catch (error) {
            logger.error('Error in handleIncomingEvent', error);
            throw new KafkaMessageProcessingError(error);
        }
    }
}