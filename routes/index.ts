/// <reference path='../.d.ts' />

import * as express from 'express';
import {UserModel} from '../data/models/Users';
import {GameModel} from '../data/models/Games';
import {IGame} from '../data/models/Games';
import {IUser} from '../data/models/Users';

module.exports = (app: express.IRouter<express.Application>) => {
	app.get('/', (req, res, next) => {
		GameModel.create({}).then((game: IGame) => {
			UserModel.create({
				username: "pesho",
				salt: "123",
				hashPass: "asd",
				games: [game._id]
			}).then((obj: IUser) => {
				res.send(200, obj);
			}, (err: any) => {
				console.error(err);
			});
		}, (err: any) => {
			console.error(err);
		});
	});
};
