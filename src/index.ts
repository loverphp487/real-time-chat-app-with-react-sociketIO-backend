import 'module-alias/register';

import CONFIG from '@/config';
import express, { type Express } from 'express';

import cors from 'cors';
import { createServer, type Server } from 'http';

import { ConnectionToDatabase } from '@/db';
import { isAuthenticated, notFound, RequestHandlerError } from '@/middlewares';
import authRouter from '@/routes/auth.route';

import userRoutes from '@/routes/user.route';
import { Server as SocketIOServer } from 'socket.io';

import chatRoute from '@/routes/chat.route';

import socketMiddleware, {
	checkUserLoginWithSocket,
} from './middlewares/socketMiddleware';

import { userSocketMap } from '@/lib';

const app: Express = express();

const httpServer: Server = createServer(app);

const io: SocketIOServer = new SocketIOServer(httpServer, {
	cors: {
		origin: true, // Adjust for your client-side origin
		credentials: true,
	},
});

app.use(socketMiddleware(io));

app.use(
	cors({
		origin: true,
		credentials: true,
	}),
);

app.options(
	'*',
	cors({
		origin: true,
		credentials: true,
	}),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * apply cors with cors options
 */

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', isAuthenticated, userRoutes);
app.use('/api/v1/chats', isAuthenticated, chatRoute);

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.use(notFound);
app.use(RequestHandlerError);
io.use(checkUserLoginWithSocket);

httpServer.listen(CONFIG.PORT || 3000, () => {
	ConnectionToDatabase();
	console.log('Server is running on port:http://localhost:' + CONFIG.PORT);
});

io.on('connection', (socket) => {
	if (socket.user && socket.userId) {
		console.log(`A user ${socket?.user?.firstName} connected`);
		socket.emit('connected', `A user ${socket?.user?.firstName} connected`);

		const userId = socket?.userId;

		userSocketMap[userId!] = socket.id;

		socket.on('disconnect', () => {
			console.log(`A user ${socket?.user?.firstName} connected`);
			delete userSocketMap[userId!];
			socket!.user = undefined;
			socket.userId = undefined;
		});
	} else {
		socket.disconnect();
	}
});

io.on('error', (error) => {
	console.error('Socket.IO error:', error);
});
