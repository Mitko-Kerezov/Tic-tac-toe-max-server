/// <reference path='../.d.ts' />

import * as express from 'express';
import {IUser} from 'Models';
import {Errors} from '../utilities/errors';
import {debug} from '../utilities/debugging';
import * as jwt from 'jsonwebtoken';
import {UserModel} from '../data/models/Users';
import {Constants} from '../constants';
import {UsersController} from '../controllers/usersController';
import {createHash} from 'crypto';
let FB = require('fb');

FB.options({ version: 'v2.8' });

export module Authentication {
	export function login(req: express.Request, res: express.Response, next: Function) {
		let username: string = req.body.username;
		let password: string = req.body.password;
		if (!username || !password) {
			res.status(401).send('Invalid credentials');
			return;
		}

		UserModel.findByUsername(username).exec((err: any, user: IUser) => {
			if (err) {
				Errors.sendErrorObject(res, err);
				return;
			}

			if (user && user.authenticate(password, user.salt, user.hashPass)) {
				sendToken(user, `User ${user.username} logged in`, res);
			} else {
				res.status(401).send('Invalid credentials');
			}
		});
	}

	export function fbLogin(req: express.Request, res: express.Response, next: Function) {
		let token: string = req.body.token;
		if (!token) {
			res.status(401).send('Invalid token');
			return;
		}

		FB.api('/me',
			{ fields: 'name,id', access_token: token },
			(result: IFacebookResponse) => {
				if (!result || result.error) {
					return res.send(401, result || 'Invalid token');
				}

				let password = createHash('sha512').digest(`${result.name}${Constants.JWTSecret}${result.id}`);
				UserModel.findByUsername(result.name).exec((err: any, user: IUser) => {
					if (err) {
						Errors.sendErrorObject(res, err);
						return;
					}

					if (user && user.authenticate(password, user.salt, user.hashPass)) {
						sendToken(user, `User ${user.username} logged in with Facebook`, res, { shouldSendUsername: true });
					} else {
						let userRequestData = { username: result.name, password: password, confirmPassword: password };
						let user = UsersController.getUser(userRequestData)
						UserModel.create(user).then((createdUser: IUser) => {
							sendToken(createdUser, `User ${user.username} registered with Facebook`, res, { statusCode: 201, shouldSendUsername: true });
						}, (innerErr: any) => {
							Errors.send(res, innerErr.message, innerErr.code || 500);
						});
					}
				});
			});
	}

	export function isAuthenticated(req: express.Request, res: express.Response, next: Function) {
		let authHeader: string = req.headers['authorization'];
		if (!authHeader || !authHeader.length) {
			Errors.send(res, Constants.AuthenticationRequired, 401);
			return;
		}

		let token = authHeader.slice('Bearer '.length);
		jwt.verify(token, Constants.JWTSecret, (err: any, user: IUser) => {
			if (err) {
				Errors.send(res, err.message || Constants.AuthenticationRequired, 401);
			} else {
				UserModel.findById(user._id.toString(), (innerErr: any, userInDb: IUser) => {
					if (userInDb) {
						req.user = userInDb;
						next();
					} else {
						Errors.send(res, innerErr && innerErr.message || Constants.AuthenticationRequired, 401);
					}
				});
			}
		});
	}

	function sendToken(user: IUser, debugMessage: string, res: express.Response, options?: { statusCode?: number, shouldSendUsername: boolean }) {
		let token = jwt.sign(user, Constants.JWTSecret, { expiresIn: '1d' });
		debug(debugMessage, user.username);
		let response: any = { token: token };
		if (options && options.shouldSendUsername) {
			response.username = user.username;
		}

		res.status(options && options.statusCode || 200).send(response);
	}
};
