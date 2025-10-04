import express, { type Express } from 'express';

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import session from 'express-session';
import cors from 'cors';
import { createServer, type Server } from 'http';
import passport from 'passport';
import CONFIG from './config';
import { ConnectionToDatabase } from './db';
import { isAuthenticated, notFound, RequestHandlerError } from './middlewares';
import authRouter from './routes/auth.route';

import userRoutes from './routes/user.route';

dotenv.config();

import './config/passport-config';
import ConnectMongoDBSession from 'connect-mongodb-session';
import ExpressMongoSanitize from 'express-mongo-sanitize';

const MongoDBStore = ConnectMongoDBSession(session);

const store = new MongoDBStore({
	uri: CONFIG.MONGO_URL as string,
	collection: 'Sessions',
});

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(CONFIG.SESSION_SECRET!));

app.use(
	ExpressMongoSanitize({
		replaceWith: '_',
		/**
		 * A function to be called when a NoSQL injection attempt is detected.
		 * It takes an object with two properties: `req` which is the Express request object,
		 * and `key` which is the key that was found to contain malicious input.
		 * The function should log a warning message indicating the path of the request and the
		 * key that was found to contain malicious input.
		 */
		onSanitize: ({ req, key }) => {
			console.warn(`NoSQL Injection attempt at ${req.path}:`, key);
		},
	}),
);

app.use(
	session({
		secret: CONFIG.COOKIES_SECRET!,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // 1 week
			httpOnly: true,
			sameSite: 'none',
			secure: true,
		},
		// store: store,
		// Boilerplate options, see:
		// * https://www.npmjs.com/package/express-session#resave
		// * https://www.npmjs.com/package/express-session#saveuninitialized
		resave: true, // this option specifies whether to save the session to the store on every request
		saveUninitialized: false, // option specifies whether to save uninitialized sessions
	}),
);

app.use(passport.initialize());
app.use(passport.session());

/**
 * apply cors with cors options
 */

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

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', isAuthenticated, userRoutes);

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.use(notFound);
app.use(RequestHandlerError);

const httpServer: Server = createServer(app);

httpServer.listen(CONFIG.port || 3000, () => {
	ConnectionToDatabase();
	console.log('Server is running on port:http://localhost:' + process.env.PORT);
});
