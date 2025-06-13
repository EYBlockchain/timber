export class GeneralConnectionError extends Error {
	constructor(error) {
		let errorMessage;

		if (typeof error === "string") {
			errorMessage = error;
		} else if (error.message) {
			errorMessage = error.message;
		} else {
			errorMessage = "Something Went Wrong!";
		}

		super(errorMessage);
		this.name = 'GeneralConnectionError';
		this.errorCode = 500;
		this.errorType = {
			stage: "EXECUTION_ERROR"
		};
		this.errorInformation = error;
	}
}

export class BemException extends Error {
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
        this.name = 'BemException';
        this.errorCode = 500;
        this.errorInformation = errorInformation;
        this.errorType = {
            stage: "EXECUTION_ERROR"
        };
    }
}

export class BemConnectionError extends GeneralConnectionError {
	constructor(errorInformation) {
		super(errorInformation);
		this.name = 'BemConnectionError';
	}
}

