/// <reference path='../.d.ts' />

import * as express from 'express';
import {IUser} from 'Models';
import {Errors} from '../utilities/errors';
import {debug} from '../utilities/debugging';
import * as jwt from 'jsonwebtoken';
import {UserModel} from '../data/models/Users';
import {Constants} from '../constants';

export module Authentication {
	export function login(req: express.Request, res: express.Response, next: Function) {
		let username: string = req.body.username;
		let password: string = req.body.password;
		UserModel.findByUsername(username).exec((err: any, user: IUser) => {
			if (err) {
				Errors.sendErrorObject(res, err);
				return;
			}

			if (user && user.authenticate(password, user.salt, user.hashPass)) {
				let token = jwt.sign(user, Constants.JWTSecret, { expiresIn: '1d'});
				debug('User %s logged in', user.username);
				res.status(200).send({ token: token });
			} else {
				res.status(401).send('Invalid credentials');
			}
		});
	}

	export function isAuthenticated(req: express.Request, res: express.Response, next: Function) {
		let authHeader: string = req.headers['authorization'];
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
};
