import jwt from 'jsonwebtoken';
import CONFIG from '@/config';

export let userSocketMap: Record<any, string> = {}; // {userId:socketId}

export const getSocketId = (userId: any) => userSocketMap[userId];

/**
 * Generates a JSON Web Token (JWT) that can be used to authenticate the user.
 * The token is signed with the COOKIE_SECRET from the environment variables.
 * The token will expire in 1 day.
 * @param {_id} The id of the user to generate the token for.
 * @returns {string} The generated JWT token.
 */
export const generateToken = (_id: any) => {
	const token = jwt.sign({ _id }, CONFIG.COOKIES_SECRET!, {
		expiresIn: '1d',
	});

	return token;
};
