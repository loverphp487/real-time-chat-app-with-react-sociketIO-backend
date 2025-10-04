import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { verifyUserService } from '../services/auth.service';

passport.use(
	new LocalStrategy(
		{ usernameField: 'email', passwordField: 'password', session: true },
		async function (username, password, done) {
			try {
				const user = await verifyUserService({ email: username, password });
				return done(null, user);
			} catch (error: any) {
				return done(error, false, error?.message);
			}
		},
	),
);

passport.serializeUser((user: any, done) => done(null, user));

passport.deserializeUser((user: any, done) => done(null, user));
