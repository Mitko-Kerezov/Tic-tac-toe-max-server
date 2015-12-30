/// <reference path='../.d.ts' />

import * as passport from 'passport';
import * as express from 'express';
import {IUser} from 'Models';
import {Errors} from '../utilities/errors';
import {debug} from '../utilities/debugging';

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

			req.logIn(user, (innerErr: any) => {
				if (innerErr) {
					return next(innerErr);
				}

				debug('User %s logged in', req.user.username);
				res.status(204).send({});
			});
		});

		auth(req, res, next);
	}

	export function logout(req: express.Request, res: express.Response, next: Function) {
		debug('User %s logged out', req.user.username);
		req.logout();
		res.status(204).send({});
	}

	export function isAuthenticated(req: express.Request, res: express.Response, next: Function) {
		if (!req.isAuthenticated()) {
			Errors.send(res, "Authentication required", 401);
		} else {
			next();
		}
	}
};
