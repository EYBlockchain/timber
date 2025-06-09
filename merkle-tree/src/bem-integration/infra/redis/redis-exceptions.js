import { GeneralConnectionError } from "../../bem-client/exceptions";

export class RedisConnectionError extends GeneralConnectionError {
	constructor(errorInformation) {
		super(errorInformation);
        this.name = "RedisConnectionError";
    }
}

export class RedisStoreError extends Error {
    constructor(errorInformation) {
        let errorMessage;

		if (typeof errorInformation === "string") {
			errorMessage = errorInformation;
		} else if (errorInformation.error?.message) {
			errorMessage = errorInformation.error?.message;
		} else {
			errorMessage = "Something Went Wrong!";
		}
        
        super(errorMessage);
        this.name = 'RedisStoreError';
        this.errorCode = 500;
        this.errorInformation = errorInformation;
        this.errorType = {
            stage: "EXECUTION_ERROR"
        };
    }
}

export class RedisRetrieveError extends Error {
    constructor(errorInformation) {
        let errorMessage;

		if (typeof errorInformation === "string") {
			errorMessage = errorInformation;
		} else if (errorInformation.error?.message) {
			errorMessage = errorInformation.error?.message;
		} else {
			errorMessage = "Something Went Wrong!";
		}
        
        super(errorMessage);
        this.name = 'RedisRetrieveError';
        this.errorCode = 500;
        this.errorInformation = errorInformation;
        this.errorType = {
            stage: "EXECUTION_ERROR"
        };
    }
}