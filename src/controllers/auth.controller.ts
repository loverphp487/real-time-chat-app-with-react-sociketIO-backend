import { HttpConfig } from '@/config';
import { AuthRegistrationService } from '@/services/auth.service';
import { loginSchema, registerSchema } from '@/validation/auth.validation';
import { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import passport from 'passport';

/**
 * Handles a login request.
 * It takes the request and response objects, and the next function in the application's request-response cycle.
 * It parses the request body using the loginSchema, and then calls the Passport authenticate function to authenticate the user.
 * If the authentication is successful, it returns a response with a status code of 200 and a message of "Logged in successfully".
 * If there is an error during the authentication process, it passes the error to the next function in the cycle.
 * @returns {Promise<any>} A promise that resolves with the response object or rejects with an error.
 */
export const LoginController = expressAsyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			const body = loginSchema.parse({ ...req.body });

			passport.authenticate(
				'local',
				function async(err: Error | null, user: Express.User) {
					if (err) {
						return next(err);
					}

					req.logIn(user, async function async(err) {
						if (err) {
							return next(err);
						}

						res
							.status(HttpConfig.OK)
							.json({ message: 'Logged in successfully' });
					});
				},
			)(req, res, next);
		} catch (error) {
			next(error);
		}
	},
);

/**
 * Handles a registration request.
 * It takes the request and response objects, and the next function in the application's request-response cycle.
 * It parses the request body using the registerSchema, and then calls the AuthRegistrationService function to register the user.
 * If the registration is successful, it returns a response with a status code of 201 and a message of "register successfully".
 * If there is an error during the registration process, it passes the error to the next function in the cycle.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function in the application's request-response cycle.
 * @returns {Promise<any>} A promise that resolves with the response object or rejects with an error.
 */
export const RegisterController = expressAsyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			const body = registerSchema.parse({ ...req.body });

			await AuthRegistrationService(body);

			return new Promise((resolve, reject) => {
				setTimeout(() => {
					return resolve(
						res
							.status(HttpConfig.CREATED)
							.json({ message: 'register successfully' }),
					);
				}, 5000);
			});
		} catch (error) {
			next(error);
		}
	},
);
