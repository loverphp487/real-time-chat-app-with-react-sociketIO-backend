import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose';

export interface UserDocument extends Document {
	firstName: string;
	email: string;
	password: string;
	profilePic: string;
	comparePassword: (value: string) => Promise<boolean>;
	omitPassword: () => Omit<UserDocument, 'password'>;
}

const userSchema = new Schema<UserDocument>(
	{
		firstName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		profilePic: { type: String, default: '' },
	},
	{
		timestamps: true,
	},
);

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		if (!this.password) return next();
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
	}
	next();
});

/**
 * Compares the provided password with the stored password hash.
 * @param {string} value - The password to compare with the stored hash.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the passwords match.
 */
userSchema.methods.comparePassword = async function (
	value: string,
): Promise<boolean> {
	return await bcrypt.compareSync(value, this.password);
};

/**
 * Returns a shallow copy of the user document with the password field omitted.
 * @returns {Object} A shallow copy of the user document without the password field.
 */
userSchema.methods.omitPassword = function () {
	const { password, __v, createdAt, updatedAt, ...user } = this.toObject();
	return user;
};

const UserModel = mongoose.model<UserDocument>('Users', userSchema);

export default UserModel;
