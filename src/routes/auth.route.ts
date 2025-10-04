import {
	LoginController,
	RegisterController,
} from '@/controllers/auth.controller';
import { Router } from 'express';

const authRouter = Router();

authRouter.post('/login', LoginController);

authRouter.post('/signup', RegisterController);

export default authRouter;
