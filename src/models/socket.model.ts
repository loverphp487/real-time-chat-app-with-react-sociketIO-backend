import { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface SocketDocument extends Document {
	userId: mongoose.Types.ObjectId;
	socketId: string;
}

const SocketSchema = new Schema<SocketDocument>({
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'Users',
		required: true,
	},
	socketId: {
		type: String,
		required: true,
	},
});

const SocketModel = mongoose.model<SocketDocument>('Socket', SocketSchema);

export default SocketModel;
