import {
	CurrentUserController,
	logOutController,
} from '../controllers/user.controller';
import { Router } from 'express';

const userRoutes = Router();

userRoutes.get('/current', CurrentUserController);
userRoutes.post('/logout', logOutController);

export default userRoutes;
