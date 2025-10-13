import { Server as SocketIOServer, type Socket } from 'socket.io';
import { Request, Response, NextFunction } from 'express';
import { BadRequestException, UnauthorizedException } from '@/utilis';
import CONFIG from '@/config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import UserModel from '@/models/user.model';

export const socketMiddleware = (io: SocketIOServer) => {
	return (req: Request, res: Response, next: NextFunction) => {
		req.io = io;
		next();
	};
};

/**
 * Checks if a user is logged in with the provided socket.
 * If the user is logged in, it will assign the user object and the user's id to the socket object.
 * If the user is not logged in, it will throw an error.
 * @param {Socket} socket - The socket object.
 * @param {any} next - The next function in the application's request-response cycle.
 * @throws {BadRequestException} - If the user is not found.
 * @throws {UnauthorizedException} - If the user is not logged in.
 */
export const checkUserLoginWithSocket = async (socket: Socket, next: any) => {
	try {
		const token = socket.handshake.headers.cookie?.split('=')[1];

		if (token) {
			const tokenValidation = jwt.verify(
				token,
				CONFIG.COOKIES_SECRET!,
			) as JwtPayload;

			const user = await UserModel.findById(tokenValidation?._id);

			socket.user = user?.omitPassword();
			socket.userId = user?._id as string;
		}

		next();
	} catch (error) {
		next(error);
	}
};

export default socketMiddleware;
