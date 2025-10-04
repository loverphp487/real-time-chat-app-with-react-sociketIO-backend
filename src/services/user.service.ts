import UserModel, { UserDocument } from '@/models/user.model';
import { UnauthorizedException } from '@/utilis';
import mongoose from 'mongoose';

/**
 * Retrieves a user document from the database by id.
 * @param {string} id - The id of the user to retrieve.
 * @returns {Promise<Pick<UserDocument, 'omitPassword'> | never | any>} A promise that resolves with the retrieved user document with the password field omitted, or rejects with an error if the user does not exist.
 * @throws {UnauthorizedException} If the user does not exist.
 */
export const getUserData = async (
	_id: string,
): Promise<Pick<UserDocument, 'omitPassword'> | never | any> => {
	const session = await mongoose.startSession();
	try {
		//start session transaction
		session.startTransaction();

		const user = await UserModel.findById({ _id });

		if (!user) throw new UnauthorizedException('Unauthorized');
		//commit transaction
		await session.commitTransaction();

		//end session
		session.endSession();

		return user.omitPassword();
	} catch (error) {
		//rollback transaction
		await session.abortTransaction();

		//end session
		session.endSession();

		//throw error
		throw error;
	}
};
