import * as express from 'express';
import { UserDocument } from '../models/user.model';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global {
	namespace Express {
		// Inject additional properties on express.Request
		interface User {
			_id?: mongoose.Types.ObjectId;
			firstName?: string;
		}

		interface Request {
			user: UserDocument;
			ip: any;
			io: SocketIOServer;
		}
	}
}

declare module 'socket.io' {
	interface User {
		_id?: mongoose.Types.ObjectId;
		firstName?: string;
	}
	interface Socket {
		user?: User;
		userId?: any;
	}
}

declare module jwt.JwtPayload {
	interface JwtPayload {
		_id?: string;
	}
}
