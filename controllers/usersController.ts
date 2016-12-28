/// <reference path='../.d.ts' />

import * as express from 'express';
import {Encryption} from '../utilities/encryption';
import {Validation} from '../utilities/validation';
import {Errors} from '../utilities/errors';
import {UserModel} from '../data/models/Users';
import {IUser, ICoreUser} from 'Models';
import {debug} from '../utilities/debugging';

export module UsersController {
	export function getStatus(req: express.Request, res: express.Response): void {
		UserModel.findById(req.user._id, (err: any, user: IUser) => {
			if (err) {
				Errors.sendErrorObject(res, err);
				return;
			}

			if (!user) {
				Errors.send(res, 'User does not exist');
				return;
			}

			res.status(200).send({
				wins: user.wins,
				losses: user.losses
			});
		});
	}

	export function postRegister(req: express.Request, res: express.Response, next: Function): void {
		let userRequestData: IUserRequestData = req.body;
		if (!userRequestData.password || userRequestData.password !== userRequestData.confirmPassword) {
			Errors.send(res, 'Password and confirm password do not match');
			return;
		}

		UserModel.findByUsername(userRequestData.username, (err: any, userInDb: IUser) => {
			if (!!userInDb) {
				Errors.send(res, 'Username already taken');
				return;
			}

			let user = getUser(userRequestData);
			UserModel.create(user).then((createdUser: IUser) => {
				debug('User %s registered', user.username);
				res.status(201).send({
					username: createdUser.username,
					wins: createdUser.wins,
					losses: createdUser.losses
				});
			}, (innerErr: any) => {
				Errors.send(res, innerErr.message, innerErr.code || 500);
			});
		});
	}

	export function getUser(userRequestData: IUserRequestData): ICoreUser {
		let salt = Encryption.generateSalt();
		return {
			username: userRequestData.username,
			salt: salt,
			hashPass: Encryption.generateHashedPassword(salt, userRequestData.password)
		};
	}
};
