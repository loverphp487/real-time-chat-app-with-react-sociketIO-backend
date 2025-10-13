import MessageModel, { MessageDocument } from '@/models/message.model';
import UserModel, { UserDocument } from '@/models/user.model';
import { NotFoundException } from '@/utilis';
import mongoose from 'mongoose';

/**
 * Retrieves a list of all users that are not the current user.
 * It takes the id of the current user as a parameter and returns a promise that resolves with an array of user documents.
 * If there is an error during the retrieval of the user list, it rejects with an error.
 * @param {mongoose.Types.ObjectId} userId - The id of the current user.
 * @returns {Promise<UserDocument[] | never>} - A promise that resolves with an array of user documents or rejects with an error.
 */
export const GetAllChatListService = async (
	userId: mongoose.Types.ObjectId,
): Promise<UserDocument[] | never> => {
	const session = await mongoose.startSession();
	try {
		//start session transaction
		session.startTransaction();

		const chatList = await UserModel.find({
			_id: {
				$ne: userId.toString(),
			},
		});

		//commit transaction
		await session.commitTransaction();

		//end session
		session.endSession();

		return chatList;
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
 * Retrieves a list of all contacts (both senders and receivers) of the current user.
 * It takes the id of the current user as a parameter and returns a promise that resolves with an array of message documents.
 * If there is an error during the retrieval of the contact list, it rejects with an error.
 * @param {mongoose.Types.ObjectId} userId - The id of the current user.
 * @returns {Promise<MessageDocument[] | never>} - A promise that resolves with an array of message documents or rejects with an error.
 */
export const GetAllContactListService = async (
	userId: mongoose.Types.ObjectId,
): Promise<UserDocument[] | never> => {
	const session = await mongoose.startSession();
	try {
		//start session transaction
		session.startTransaction();

		const contactList = await MessageModel.find({
			$or: [{ senderId: userId.toString() }, { receiverId: userId.toString() }],
		});

		const list = [
			...new Set(
				contactList.map((item) => {
					return item.senderId._id.toString() === userId.toString()
						? item.receiverId
						: item.senderId;
				}),
			),
		];

		const AllContactList: any = await UserModel.find({
			_id: {
				$in: list,
			},
		}).select('-password -createdAt -updatedAt -_v');

		//commit transaction
		await session.commitTransaction();

		//end session
		session.endSession();

		return AllContactList;
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
 * Adds a new message to the database.
 * It takes the senderId, receiverId and message as parameters.
 * It checks if the user exists and if not, it throws a NotFoundException.
 * It then creates a new message document and saves it to the database.
 * If successful, it returns the newly created message document.
 * If there is an error, it passes the error to the next function in the cycle.
 * @param {mongoose.Types.ObjectId} senderId - The id of the sender.
 * @param {mongoose.Types.ObjectId} receiverId - The id of the receiver.
 * @param {string} message - The message to be sent.
 * @returns {Promise<MessageDocument | never>} A promise that resolves with the newly created message document, or rejects with an error.
 */
export const AddNewMessageService = async (
	senderId: mongoose.Types.ObjectId,
	receiverId: mongoose.Types.ObjectId,
	message: string,
): Promise<MessageDocument | never> => {
	const session = await mongoose.startSession();
	try {
		//start session transaction
		session.startTransaction();

		const checkUserExits = await UserModel.findOne({
			_id: receiverId.toString(),
		});

		if (!checkUserExits) {
			throw new NotFoundException('user Not  exits');
		}

		const newMessage = await MessageModel.create({
			senderId: senderId.toString(),
			receiverId: receiverId.toString(),
			message,
		});

		//commit transaction
		await session.commitTransaction();

		//end session
		session.endSession();

		return newMessage;
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
 * Retrieves all messages between two users.
 * It takes the senderId and receiverId as parameters.
 * It checks if the user exists and if not, it throws a NotFoundException.
 * It then retrieves all messages between the two users and returns them.
 * If there is an error, it passes the error to the next function in the cycle.
 * @param {mongoose.Types.ObjectId} senderId - The id of the sender.
 * @param {string} receiverId - The id of the receiver.
 * @returns {Promise<MessageDocument[] | never>} A promise that resolves with all messages between the two users, or rejects with an error.
 */
export const GetAllChatConversationService = async (
	senderId: mongoose.Types.ObjectId,
	receiverId: string,
): Promise<MessageDocument[] | never> => {
	const session = await mongoose.startSession();
	try {
		//start session transaction
		session.startTransaction();

		const Messages = await MessageModel.find({
			$or: [
				{ senderId: senderId.toString(), receiverId: receiverId.toString() },
				{ senderId: receiverId.toString(), receiverId: senderId.toString() },
			],
		}).select('-__v -updatedAt');

		//commit transaction
		await session.commitTransaction();

		//end session
		session.endSession();

		return Messages;
	} catch (error) {
		//rollback transaction
		await session.abortTransaction();

		//end session
		session.endSession();

		//throw error
		throw error;
	}
};
