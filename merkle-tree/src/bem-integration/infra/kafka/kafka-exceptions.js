import { GeneralConnectionError } from "../../bem-client/exceptions";

export class KafkaConnectionError extends GeneralConnectionError {
	constructor(errorInformation) {
		super(errorInformation);
        this.name = "KafkaConnectionError";
    }
}

export class KafkaSubscriptionError extends Error {
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
        this.name = 'KafkaSubscriptionError';
        this.errorCode = 500;
        this.errorInformation = errorInformation;
        this.errorType = {
            stage: "EXECUTION_ERROR"
        };
    }

}

export class KafkaMessageProcessingError extends Error {
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
        this.name = 'KafkaMessageProcessingError';
        this.errorCode = 500;
        this.errorInformation = errorInformation;
        this.errorType = {
            stage: "EXECUTION_ERROR"
        };
    }
}