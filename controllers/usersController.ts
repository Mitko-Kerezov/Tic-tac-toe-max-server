/// <reference path='../.d.ts' />

import * as express from 'express';
import {Encryption} from '../utilities/encryption';
import {Validation} from '../utilities/validation';
import {Errors} from '../utilities/errors';
import {UserModel} from '../data/models/Users';
import {IUser} from 'Models';
import {debug} from '../utilities/debugging';

export module UsersController {
	export function postRegister(req: express.Request, res: express.Response, next: Function): void {
		let userRequestData: IUserRequestData = req.body;
		if (!Validation.checkUsername(userRequestData.username)) {
			Errors.send(res, 'Invalid username');
			return;
		}

		if (!userRequestData.password || userRequestData.password !== userRequestData.confirmPassword) {
			Errors.send(res, 'Password and confirm password do not match');
			return;
		}

		UserModel.findByUsername(userRequestData.username, (err: any, userInDb: IUser) => {
			if (!!userInDb) {
				Errors.send(res, 'Username already taken');
				return;
			}

			let salt = Encryption.generateSalt();
			let user = {
				username: userRequestData.username,
				salt: salt,
				hashPass: Encryption.generateHashedPassword(salt, userRequestData.password)
			};

			UserModel.create(user).then((createdUser: IUser) => {
				debug('User %s registered', user.username);
				res.status(201).send(createdUser);
			}, (innerErr: any) => {
				Errors.send(res, innerErr.message, innerErr.code || 500);
			});
		});
	}
};
