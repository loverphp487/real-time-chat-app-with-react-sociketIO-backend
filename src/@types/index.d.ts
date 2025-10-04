import * as express from 'express';
import { UserDocument } from '../models/user.model';

declare global {
	namespace Express {
		// Inject additional properties on express.Request
		interface User {
			_id?: any;
			email?: any;
			password?: any;
		}

		interface Request {
			user: UserDocument;
			ip: any;
		}
	}
}
