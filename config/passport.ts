/// <reference path='../.d.ts' />

import * as passport from 'passport';
import * as mongoose from 'mongoose';
import {Strategy} from 'passport-local';
import {IUser} from 'Models';
import {UserModel} from '../data/models/Users';

module.exports = () => {
	passport.use(new Strategy((username: string, password: string, done: (err: any, user: IUser) => void) => {
		UserModel.findByUsername(username).exec((err: any, user: IUser) => {
			if (err) {
				console.error('Error loading user: ' + err);
				return;
			}

			if (user && user.authenticate(password, user.salt, user.hashPass)) {
				return done(null, user);
			} else {
				return done(null, null);
			}
		})
	}));

	passport.serializeUser((user: IUser, done: (err: any, userId: mongoose.Types.ObjectId) => void) => {
		if (user) {
			return done(null, user._id);
		}
	});

	passport.deserializeUser((id: string, done: (err: any, user: IUser) => void) => {
		UserModel.findOne({_id: id}).exec((err: any, user: IUser) => {
			if (err) {
				console.error('Error loading user: ' + err);
				return;
			}

			if (user) {
				return done(null, user);
			} else {
				return done(null, null);
			}
		})
	});
};
