/// <reference path='../../.d.ts' />

import {Encryption} from '../../utilities/encryption';
import mongoose = require('mongoose');

export interface IUser extends mongoose.Document {
	username: string;
	salt: string;
	hashPass: string;
	wins: number;
	losses: number;
	gameIds: string[];

	authenticate(password: string, salt: string, hashPass: string): boolean;
}

export interface IUserModel extends mongoose.Model<IUser> {
	findByUsername(username: string, callback?: (err: any, res: IUser) => void): mongoose.Query<IUser>;
}

export let UserModel = <IUserModel>mongoose.model<IUser>('User',
	new mongoose.Schema({
		username: { type: String, require: '{PATH} is required', unique: true },
		salt: { type: String, required: true},
		hashPass: { type: String, required: true},
		wins: { type: Number, default: 0},
		losses: { type: Number, default: 0},
		gameIds: { type: Array, default: []},
	})
	.method({
		authenticate: (password: string, salt: string, hashPass: string): boolean => {
			if (Encryption.generateHashedPassword(salt, password) === hashPass) {
				return true;
			} else {
				return false;
			}
		}
	})
	.static('findByUsername', (username: string, callback?: (err: any, res: IUser) => void): mongoose.Query<IUser> => {
		return UserModel.findOne({ username: new RegExp(username, 'i') }, callback);
	})
);
