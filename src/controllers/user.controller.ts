import { HttpConfig } from '@/config';
import { getUserData } from '@/services/user.service';
import { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';

/**
 * Handles a current user request.
 * It takes the request and response objects, and the next function in the application's request-response cycle.
 * It retrieves the user's data from the database using the getUserData function and returns a response with a status code of 200 and the user's data.
 * If there is an error during the retrieval of the user's data, it passes the error to the next function in the cycle.
 * @returns {Promise<any>} A promise that resolves with the response object or rejects with an error.
 */
export const CurrentUserController = expressAsyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			const user = await getUserData(req.user?._id);

			res.status(HttpConfig.OK).json({
				message: 'you are login successfully',
				user,
			});
		} catch (error) {
			next(error);
		}
	},
);

/**
 * Handles a logout request.
 * It takes the request and response objects, and the next function in the application's request-response cycle.
 * It logs out the user by calling the req.logout function and then destroys the session using the req.session.destroy function.
 * It then clears the 'connect.sid' cookie from the response and returns a response with a status code of 200 and a message of 'Logged out successfully'.
 * If there is an error during the logout process, it passes the error to the next function in the cycle.
 */
export const logOutController = expressAsyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			res.clearCookie('token');

			res.status(HttpConfig.OK).json({ message: 'Logged out successfully' });
		} catch (error) {
			next(error);
		}
	},
);
