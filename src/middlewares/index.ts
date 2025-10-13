import CONFIG, { HttpConfig } from '@/config';
import UserModel from '@/models/user.model';
import { AppError, BadRequestException, UnauthorizedException } from '@/utilis';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Error as MongooseError } from 'mongoose';
import { ZodError } from 'zod';

/**
 * A middleware function that handles a 404 NOT FOUND error.
 * It takes the request and response objects, and the next function in the application's request-response cycle.
 * It returns a response with a status code of 404 and an error message.
 * The error message is in the format of "URL:<request.url> NOT FOUND!".
 * The error is then passed to the next function in the cycle.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function in the application's request-response cycle.
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
	const error = new Error(`URL:${req.originalUrl} NOT FOUND!`);
	res.status(HttpConfig.NOT_FOUND);
	next(error);
};

export const RequestHandlerError: ErrorRequestHandler = (
	error: Error,
	req: Request,
	res: Response,
	next: NextFunction,
): any => {
	const statusCode =
		res.statusCode === HttpConfig.OK
			? HttpConfig.INTERNAL_SERVER_ERROR
			: res.statusCode;

	if (error instanceof SyntaxError) {
		return res.status(HttpConfig.BAD_REQUEST).json({
			message: 'invalid json format, send valid body data',
		});
	}
	if (error instanceof AppError) {
		return res.status(error.statusCode).json({
			message: error.message,
		});
	}

	if (error instanceof ZodError) {
		const errorsMessages = error.errors.map((err: any) => ({
			message: `${err.path.join('.')}: is ${err.message}`,
		}));
		return res.status(HttpConfig.BAD_REQUEST).json({
			error: 'Invalid data',
			message: errorsMessages[0].message,
		});
	}

	// Handle Mongoose CastError (e.g., invalid type for a field)
	if (error instanceof MongooseError.CastError) {
		return res.status(HttpConfig.BAD_REQUEST).json({
			message: 'Invalid data type',
			error: `Invalid value '${error.value}' for field '${error.path}'`,
		});
	}

	// Handle other Mongoose validation errors
	if (error instanceof MongooseError.ValidationError) {
		return res.status(HttpConfig.BAD_REQUEST).json({
			message: 'Validation failed',
			error: error.message,
		});
	}

	if (process.env.NODE_ENV === 'production') {
		return res.status(statusCode).json({
			message: error.message,
		});
	}

	res.status(statusCode).json({
		message: error.message,
		stack: error.stack,
	});
};

/**
 * A middleware function that checks if a user is authenticated.
 * If the user is not authenticated, it throws an UnauthorizedException.
 * If the user is authenticated, it calls the next function in the application's request-response cycle.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function in the application's request-response cycle.
 */
export const isAuthenticated = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');

		if (!token) {
			throw new UnauthorizedException('Unauthorized. Please log in.');
		}
		const tokenValidation = jwt.verify(
			token,
			CONFIG.COOKIES_SECRET!,
		) as JwtPayload;
		if (!tokenValidation) {
			throw new UnauthorizedException('token has been Expired. Please log in.');
		}

		const user = await UserModel.findById(tokenValidation?._id);

		if (!user) {
			throw new BadRequestException('User not found');
		}

		req.user = user.omitPassword();

		next();
	} catch (error) {
		next(error);
	}
};
