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

// import '@/config/passport-config';
import chatRoute from '@/routes/chat.route';
// import ConnectMongoDBSession from 'connect-mongodb-session';
// import ExpressMongoSanitize from 'express-mongo-sanitize';
import socketMiddleware, {
	checkUserLoginWithSocket,
} from './middlewares/socketMiddleware';

// const MongoDBStore = ConnectMongoDBSession(session);

// const store = new MongoDBStore({
// 	uri: CONFIG.MONGO_URL as string,
// 	collection: 'Sessions',
// });

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

// app.use(cookieParser(CONFIG.SESSION_SECRET!));

// app.use(
// 	ExpressMongoSanitize({
// 		replaceWith: '_',
// 		/**
// 		 * A function to be called when a NoSQL injection attempt is detected.
// 		 * It takes an object with two properties: `req` which is the Express request object,
// 		 * and `key` which is the key that was found to contain malicious input.
// 		 * The function should log a warning message indicating the path of the request and the
// 		 * key that was found to contain malicious input.
// 		 */
// 		onSanitize: ({ req, key }) => {
// 			console.warn(`NoSQL Injection attempt at ${req.path}:`, key);
// 		},
// 	}),
// );

// app.use(
// 	session({
// 		secret: CONFIG.SESSION_SECRET as string, // Replace with a strong, randomly generated secret
// 		resave: false,
// 		saveUninitialized: false,
// 		store: store,
// 		cookie: {
// 			secure: CONFIG.ENV_NODE === 'production', // Use secure cookies in production
// 			sameSite: CONFIG.ENV_NODE === 'production' ? 'none' : 'lax', // Adjust based on deployment
// 			maxAge: 1000 * 60 * 60 * 24, // 24 hours
// 			httpOnly: true,
// 		},
// 	}),
// );

// app.use(passport.initialize());
// app.use(passport.session());

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
// io.use(checkUserLoginWithSocket);

httpServer.listen(CONFIG.PORT || 3000, () => {
	ConnectionToDatabase();
	console.log('Server is running on port:http://localhost:' + CONFIG.PORT);
});

let userSocketMap: Record<any, string> = {}; // {userId:socketId}

io.on('connection', (socket) => {
	console.log(`A user ${socket?.user?.firstName} connected`);
	const userId = socket?.userId;
	userSocketMap[userId!] = socket.id;

	socket.on('disconnect', () => {
		console.log('A user disconnected', socket?.user?.firstName);
		delete userSocketMap[userId!];
	});
	// Handle other Socket.IO events
});

// io.on('error', (error) => {
// 	console.error('Socket.IO error:', error);
// });
