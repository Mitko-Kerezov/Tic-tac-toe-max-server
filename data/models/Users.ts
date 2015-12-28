/// <reference path='../../.d.ts' />

import * as encryption from '../../utilities/encryption';
import * as games from './Games';
import mongoose = require('mongoose');

let userSchema: mongoose.Schema = new mongoose.Schema({
		username: { type: String, require: '{PATH} is required', unique: true },
		salt: { type: String, required: true},
		hashPass: { type: String, required: true},
		wins: { type: Number, default: 0},
		losses: { type: Number, default: 0},
		gameIds: { type: Array, default: []},
	})
	.static('findByUsername', (username: string, callback?: (err: any, res: IUser) => void) => {
		UserModel.findOne({ username: new RegExp(username, 'i') }, callback);
	})
	.method({
		authenticate: (password: string) => {
			if (encryption.generateHashedPassword(this.salt, password) === this.hashPass) {
				return true;
			} else {
				return false;
			}
		}
	});

export interface IUser extends mongoose.Document {
	username: string;
	salt: string;
	hashPass: string;
	wins: number;
	losses: number;
	gameIds: string[]
}

export interface IUserModel extends mongoose.Model<IUser> {
	findByUsername(username: string, cb: Function): IUser;
}

export let UserModel = <IUserModel>mongoose.model<IUser>('User', userSchema);
