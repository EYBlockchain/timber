import axios from "axios";
import logger from "../../logger";
import { BemException, BemConnectionError } from "./exceptions";
import { redisClient } from "../infra/redis/redis-client";

const BEM_METADATA_STORE = 'metadata-store';

const handleBemException = (exception) => {
	if (exception?.response?.data) {
		throw new BemException(exception?.response?.data);
	}
	throw new BemConnectionError(exception);
}

export const subscribeToBemEvents = async (contractAddress, eventSpecification) => {
	try {
		logger.info(`Subscribing to bem with ${contractAddress}`);

		const context = JSON.parse(await redisClient.hget(BEM_METADATA_STORE, contractAddress) || '{}')?.context;
		if (!context) throw new Error(`Context not found in Redis for ${contractAddress}`);

		logger.debug('Fetched context details from Redis: ');

		const axiosConfig = {
			method: "post",
			url: `${process.env.BEM_ENDPOINT}/contract-event/subscribe`,
			headers: { context: JSON.stringify(context) }, timeout: 3600000,
			data: {
				productIdentifier: 'ocm',
				contractAddress,
				eventSpecification,
				callbackTopicSuffix: process.env.CALLBACK_TOPIC_SUFFIX
			},
		};
		await axios(axiosConfig);
	} catch (error) {
		handleBemException(error);
	}
};
