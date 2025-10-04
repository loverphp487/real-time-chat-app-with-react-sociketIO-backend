import 'module-alias/register';

import express, { type Express } from 'express';

import CONFIG from '@/config';
import { ConnectionToDatabase } from '@/db';
import { isAuthenticated, notFound, RequestHandlerError } from '@/middlewares';
import authRouter from '@/routes/auth.route';
import connectMongo from 'connect-mongodb-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import session from 'express-session';
import { createServer, type Server } from 'http';
import passport from 'passport';

import '@/config/passport-config';
import userRoutes from '@/routes/user.route';

const MongoDBStore = connectMongo(session);

const store = new MongoDBStore({
	uri: CONFIG.MONGO_URL as string,
	collection: 'Sessions',
});

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(CONFIG.COOKIES_SECRET as string));
app.use(
	mongoSanitize({
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
		secret: CONFIG.SESSION_SECRET as string,
		cookie: {
			secure: CONFIG.ENV_NODE === 'production' ? true : false, // Set to true in production with HTTPS
			sameSite: CONFIG.ENV_NODE === 'production' ? 'none' : 'lax',
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		},
		store: store,
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
