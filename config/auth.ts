/// <reference path='../.d.ts' />

import * as passport from 'passport';
import * as express from 'express';
import {IUser} from '../data/models/Users';
import {Errors} from '../utilities/errors';

export module Authentication {
	export function login(req: express.Request, res: express.Response, next: Function) {
		let auth = passport.authenticate('local', (err: any, user: IUser) => {
			if (err)  {
				return next(err);
			}

			if (!user) {
				Errors.send(res, "Invalid username or password!");
				return;
			}

			req.logIn(user, (err: any) => {
				if (err) {
					return next(err);
				}

				res.status(200).send({});
			})
		});

		auth(req, res, next);
	}

	export function logout(req: express.Request, res: express.Response, next: Function) {
		req.logout();
		res.status(200).send({});
	}

	export function isAuthenticated(req: express.Request, res: express.Response, next: Function) {
		if (!req.isAuthenticated()) {
			Errors.send(res, "Authentication required", 401);
		} else {
			next();
		}
	}
};
