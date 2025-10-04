import CONFIG from '../config';
import mongoose from 'mongoose';

/**
 * Establishes a connection to the MongoDB database.
 *
 * @returns {Promise<void>} A promise that resolves when the database is connected.
 * @throws {Error} If there is an error connecting to the database.
 * @example
 * const connection = await ConnectionToDatabase();
 * console.log(connection);
 */
export const ConnectionToDatabase = async (): Promise<void> => {
	try {
		const Conn = await mongoose.connect(CONFIG.MONGO_URL as string);
		console.log(`database is connecting successfully ${Conn.connection.host}`);
	} catch (error: any) {
		console.log(`database connection error ${error.message}`);
		process.exit(1);
	}
};

/**
 * Disconnects from the MongoDB database.
 *
 * @returns {Promise<void>} A promise that resolves when the database is disconnected.
 * @throws {Error} If there is an error disconnecting from the database.
 * @example
 * const disconnection = await DisconnectFromDatabase();
 * console.log(disconnection);
 */
export const DisconnectFromDatabase = async (): Promise<void> => {
	try {
		await mongoose.disconnect();
		console.log('disconnect from database successfully');
	} catch (error: any) {
		console.log(`database disconnect error ${error.message}`);
	}
};
