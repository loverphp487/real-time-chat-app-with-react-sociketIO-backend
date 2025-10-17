import {
	CurrentUserController,
	logOutController,
	UpdateUserProfileController,
} from '@/controllers/user.controller';
import { Router } from 'express';

const userRoutes = Router();

userRoutes.get('/current', CurrentUserController);
userRoutes.post('/update-profile', UpdateUserProfileController);
userRoutes.post('/logout', logOutController);

export default userRoutes;
