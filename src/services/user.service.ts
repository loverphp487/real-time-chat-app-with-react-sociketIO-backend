import cloudinary from '@/lib/cloudinary';
import UserModel, { UserDocument } from '@/models/user.model';
import { BadRequestException, UnauthorizedException } from '@/utilis';
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

/**
 * Updates a user's profile picture.
 * @param {{ profilePic: string; userId: string; }} - The object containing the profile picture and the user's id.
 * @returns {Promise<Pick<UserDocument, 'omitPassword'> | never | any>} A promise that resolves with the updated user document with the password field omitted, or rejects with an error if the user does not exist.
 * @throws {UnauthorizedException} If the user does not exist.
 */
export const updateProfilePicture = async (
	profilePic: string,
	userId: string,
): Promise<Pick<UserDocument, 'omitPassword'> | never | any> => {
	const session = await mongoose.startSession();
	try {
		//start session transaction
		session.startTransaction();

		if (!profilePic) {
			throw new BadRequestException('profile Picture is required');
		}

		const uploadResponse = await cloudinary.uploader.upload(profilePic);

		const user = await UserModel.findOneAndUpdate(
			{ _id: userId },
			{ profilePic: uploadResponse.secure_url },
			{ new: true },
		);

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
