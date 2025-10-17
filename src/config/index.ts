import 'dotenv/config';

const CONFIG = {
	PORT: process.env.PORT || 3000,
	MONGO_URL: process.env.MONGO_URL,
	ENV_NODE: process.env.ENV_NODE,
	WHITELIST_ORIGIN: ['*'],
	SESSION_SECRET: process.env.SESSION_SECRET,
	COOKIES_SECRET: process.env.COOKIES_SECRET,
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

export const HttpConfig = {
	// Success responses
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,

	// Client error responses
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	TOO_MANY_REQUESTS: 429,

	// Server error responses
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
};

export type HTTPConfigType = (typeof HttpConfig)[keyof typeof HttpConfig];

export default CONFIG;
