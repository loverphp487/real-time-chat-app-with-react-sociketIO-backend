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

export const checkUserLoginWithSocket = async (socket: Socket, next: any) => {
	try {
		const token = socket.handshake.headers.cookie?.split('=')[1];

		if (token) {
			const tokenValidation = jwt.verify(
				token,
				CONFIG.COOKIES_SECRET!,
			) as JwtPayload;
			// if (!tokenValidation) {
			// 	throw new UnauthorizedException('token has been Expired. Please log in.');
			// }

			const user = await UserModel.findById(tokenValidation?._id);

			if (!user) {
				throw new BadRequestException('User not found');
			}

			socket.user = user.omitPassword();
			socket.userId = user._id as string;
		}

		next();
	} catch (error) {
		next(error);
	}
};

export default socketMiddleware;
