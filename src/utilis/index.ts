import { HttpConfig, HTTPConfigType } from '../config';

export class AppError extends Error {
	public statusCode: HTTPConfigType;

	/**
	 * Constructor for AppError.
	 * @param {string} message - The error message.
	 * @param {HTTPConfigType} statusCode - The HTTP status code for the error.
	 */
	constructor(message: string, statusCode: HTTPConfigType) {
		super(message);
		this.statusCode = statusCode;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class InternalServerException extends AppError {
	/**
	 * Constructor for InternalServerException.
	 * @param {string} [message='Internal Server Error'] - The error message.
	 * @param {HTTPConfigType} [statusCode=HttpConfig.INTERNAL_SERVER_ERROR] - The HTTP status code for the error.
	 */
	constructor(
		message: string = 'Internal Server Error',
		statusCode: HTTPConfigType = HttpConfig.INTERNAL_SERVER_ERROR,
	) {
		super(message, statusCode);
	}
}

export class NotFoundException extends AppError {
	/**
	 * Constructor for NotFoundException.
	 * @param {string} [message='Not Found'] - The error message.
	 * @param {HTTPConfigType} [statusCode=HttpConfig.NOT_FOUND] - The HTTP status code for the error.
	 */
	constructor(
		message: string = 'Not Found',
		statusCode: HTTPConfigType = HttpConfig.NOT_FOUND,
	) {
		super(message, statusCode);
	}
}

export class BadRequestException extends AppError {
	/**
	 * Constructor for BadRequestException.
	 * @param {string} [message='Bad Request'] - The error message.
	 * @param {HTTPConfigType} [statusCode=HttpConfig.BAD_REQUEST] - The HTTP status code for the error.
	 */
	constructor(
		message: string = 'Bad Request',
		statusCode: HTTPConfigType = HttpConfig.BAD_REQUEST,
	) {
		super(message, statusCode);
	}
}

export class UnauthorizedException extends AppError {
	/**
	 * Constructor for UnauthorizedException.
	 * @param {string} [message='Unauthorized Access'] - The error message.
	 * @param {HTTPConfigType} [statusCode=HttpConfig.UNAUTHORIZED] - The HTTP status code for the error.
	 */
	constructor(
		message: string = 'Unauthorized Access',
		statusCode: HTTPConfigType = HttpConfig.UNAUTHORIZED,
	) {
		super(message, statusCode);
	}
}
