import axios from "axios";
import config from "config";
import fs from "fs"
import logger from "../../logger";
import { BemException, BemConnectionError } from "./exceptions";
import { redisClient } from "../infra/redis/redis-client";

const REDIS_DATA_STORE_KEY = 'store-data';

const handleBemException = (exception) => {
	if (exception?.response?.data) {
		throw new BemException(exception?.response?.data);
	}
	throw new BemConnectionError(exception);
}

export const subscribeToBemEvents = async (contractAddress, eventSpecification) => {
	try {
		logger.info(`Subscribing to bem with ${contractAddress}`);

		const result = await redisClient.hget(REDIS_DATA_STORE_KEY, contractAddress)
		const axiosConfig = {
			method: "post",
			url: `${process.env.BEM_ENDPOINT}/contract-event/subscribe`,
			headers: {
				context: result.context,
			},
			data: {
				productIdentifier: 'ocm',
				contractAddress,
				eventSpecification,
				callbackTopicSuffix: process.env.CALLBACK_TOPIC_SUFFIX
			},
			timeout: 3600000,
		};
		await axios(axiosConfig);
	} catch (error) {
		handleBemException(error);
	}
};
