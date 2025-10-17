import { HttpConfig } from '@/config';
import SocketModel from '@/models/socket.model';
import UserModel from '@/models/user.model';
import {
	AddNewMessageImageService,
	AddNewMessageService,
	GetAllChatConversationService,
	GetAllChatListService,
	GetAllContactListService,
} from '@/services/chat.service';
import { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';

/**
 * Retrieves a list of all users that are not the current user.
 * It takes the request and response objects, and the next function in the application's request-response cycle.
 * It retrieves the user's data from the database using the GetAllChatListService function and returns a promise that resolves with a response with a status code of 202 and the user's data.
 * If there is an error during the retrieval of the user's data, it passes the error to the next function in the cycle.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function in the application's request-response cycle.
 * @returns {Promise<any>} A promise that resolves with the response object or rejects with an error.
 */
export const AllChatListController = expressAsyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			const users = await GetAllChatListService(req.user?._id);
			return res.status(HttpConfig.ACCEPTED).json({ users });
		} catch (error) {
			next(error);
		}
	},
);

/**
 * Retrieves a list of all users that are not the current user.
 * It takes the request and response objects, and the next function in the application's request-response cycle.
 * It retrieves the user's data from the database using the GetAllContactListService function and returns a promise that resolves with a response with a status code of 202 and the user's data.
 * If there is an error during the retrieval of the user's data, it passes the error to the next function in the cycle.
 * @returns {Promise<any>} A promise that resolves with the response object or rejects with an error.
 */
export const AllContactListController = expressAsyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			const users = await GetAllContactListService(req.user?._id);
			return res.status(HttpConfig.ACCEPTED).json({ users });
		} catch (error) {
			next(error);
		}
	},
);

/**
 * Handles a request to add a new message.
 * It takes the request and response objects, and the next function in the application's request-response cycle.
 * It retrieves the user's data from the request body and calls the AddNewMessageService function to add a new message.
 * If the message is added successfully, it returns a promise that resolves with a response with a status code of 202 and the added message.
 * If there is an error during the addition of the message, it passes the error to the next function in the cycle.
 * @returns {Promise<any>} A promise that resolves with the response object or rejects with an error.
 */
export const AddNewMessageController = expressAsyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			const { receiverId, message } = req.body;
			const senderId = req.user?._id;

			await AddNewMessageService(senderId, receiverId, message);

			const socketReciver = await SocketModel.findOne({
				userId: receiverId,
			});

			const user = await UserModel.findOne({ _id: senderId });

			if (socketReciver && req.io) {
				req.io
					?.to(socketReciver.socketId)
					.emit('newMessage', { user: user?.omitPassword() });
			}

			return res.status(HttpConfig.ACCEPTED).json({});
		} catch (error) {
			next(error);
		}
	},
);

/**
 * Handles a request to add a new message with an image.
 * It takes the request and response objects, and the next function in the application's request-response cycle.
 * It retrieves the user's data from the request body and calls the AddNewMessageImageService function to add a new message.
 * If the message is added successfully, it returns a promise that resolves with a response with a status code of 202 and an empty object.
 * If there is an error during the addition of the message, it passes the error to the next function in the cycle.
 * @returns {Promise<any>} A promise that resolves with the response object or rejects with an error.
 */
export const AddNewMessageImageController = expressAsyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			const { receiverId, image } = req.body;
			const senderId = req.user?._id;

			await AddNewMessageImageService(senderId, receiverId, image);

			const user = await UserModel.findOne({ _id: receiverId });

			const socketReciver = await SocketModel.findOne({
				userId: senderId,
			});

			if (socketReciver && req.io) {
				req.io
					?.to(socketReciver.socketId)
					.emit('newMessage', { user: user?.omitPassword() });
			}

			return res.status(HttpConfig.ACCEPTED).json({});
		} catch (error) {
			next(error);
		}
	},
);

/**
 * Retrieves a list of all messages between the current user and the user specified by the receiverId parameter.
 * It takes the request and response objects, and the next function in the application's request-response cycle.
 * It retrieves the user's data from the database using the GetAllChatConversationService function and returns a promise that resolves with a response with a status code of 202 and the user's data.
 * If there is an error during the retrieval of the user's data, it passes the error to the next function in the cycle.
 * @returns {Promise<any>} A promise that resolves with the response object or rejects with an error.
 */
export const AllChatConversationController = expressAsyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			const { receiverId } = req.params;
			const senderId = req.user?._id;
			const messages = await GetAllChatConversationService(
				senderId,
				receiverId,
			);
			return new Promise((resolve) => {
				setTimeout(() => {
					return resolve(res.status(HttpConfig.ACCEPTED).json({ messages }));
				}, 1500);
			});
		} catch (error) {
			next(error);
		}
	},
);
