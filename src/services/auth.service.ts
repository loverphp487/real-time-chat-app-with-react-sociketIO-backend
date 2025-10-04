import UserModel, { UserDocument } from '../models/user.model';
import {
	BadRequestException,
	NotFoundException,
	UnauthorizedException,
} from '../utilis';
import { loginSchema, registerSchema } from '../validation/auth.validation';
import mongoose from 'mongoose';
import z from 'zod';

/**
 * Registers a new user in the database.
 * @param {body: z.infer<typeof registerSchema>} - The body of the request containing the user's details.
 * @returns {Promise<any | never>} - A promise that resolves with the created user or rejects with an error.
 * @throws {BadRequestException} - If the user already exists or if there was an error creating the user.
 */
export const AuthRegistrationService = async (
	body: z.infer<typeof registerSchema>,
): Promise<any | never> => {
	const { firstName, email, password } = body;
	const session = await mongoose.startSession();
	try {
		//start session transaction
		session.startTransaction();

		//check if user already exists
		const existingEmail = await UserModel.findOne({ email });

		if (existingEmail) {
			throw new BadRequestException('User already exists');
		}

		const user = await UserModel.create({
			firstName,
			email,
			password,
			profilePic:
				'https://avatar.iran.liara.run/username?username=' +
				firstName.trim().split(' ').join('+'),
		});

		if (!user) {
			throw new BadRequestException('User not created');
		}

		//commit transaction
		await session.commitTransaction();

		//end session
		session.endSession();
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
 * Verifies a user by their email and password.
 * It takes a request body containing an email and a password, and then checks if the user already exists.
 * If the user does not exist, it throws a NotFoundException.
 * If the user exists, it then checks if the password is valid.
 * If the password is invalid, it throws an UnauthorizedException.
 * If the user is found and the password is valid, it returns the user document with the password field omitted.
 * If there is an error during the verification process, it passes the error to the next function in the cycle.
 * @param {z.infer<typeof loginSchema>} body - The request body containing the email and password.
 * @returns {Promise<Omit<UserDocument, 'password'> | undefined | never>} A promise that resolves with the user document with the password field omitted, or rejects with an error if the user does not exist or the password is invalid.
 */
export const verifyUserService = async (
	body: z.infer<typeof loginSchema>,
): Promise<Omit<UserDocument, 'password'> | undefined | never> => {
	const { email, password } = body;
	const session = await mongoose.startSession();
	try {
		//start session transaction
		session.startTransaction();
		//check if user already exists
		const existingEmail = await UserModel.findOne({ email });

		if (!existingEmail) {
			throw new NotFoundException('email does not exits');
		}

		//check password
		const comparePassword = await existingEmail.comparePassword(password);

		if (!comparePassword) {
			throw new UnauthorizedException('password is invalid');
		}

		const user = await UserModel.findById(existingEmail._id);

		if (!user) {
			throw new BadRequestException('User not found');
		}

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
