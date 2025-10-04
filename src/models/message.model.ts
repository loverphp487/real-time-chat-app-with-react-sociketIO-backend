import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';

export interface MessageDocument extends Document {
	senderId: mongoose.Types.ObjectId;
	receiverId: mongoose.Types.ObjectId;
	message: string;
	image?: string;
}

const messageSchema = new Schema<MessageDocument>(
	{
		senderId: {
			type: Schema.Types.ObjectId,
			ref: 'Users',
			required: true,
		},
		receiverId: {
			type: Schema.Types.ObjectId,
			ref: 'Users',
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		image: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

const MessageModel = mongoose.model<MessageDocument>('Messages', messageSchema);

export default MessageModel;
