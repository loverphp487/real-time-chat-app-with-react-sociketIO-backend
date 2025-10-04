import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { verifyUserService } from '../services/auth.service';

passport.use(
	new LocalStrategy(
		{ usernameField: 'email', passwordField: 'password', session: true },
		async function (email, password, done) {
			try {
				const user = await verifyUserService({ email, password });

				return done(null, { email, password });
			} catch (error: any) {
				return done(error, false, error?.message);
			}
		},
	),
);

passport.serializeUser((user: any, done) => done(null, user));

passport.deserializeUser((user: any, done) => done(null, user));
