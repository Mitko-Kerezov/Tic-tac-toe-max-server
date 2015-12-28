/// <reference path='../.d.ts' />

import * as express from 'express';
// import mongoose = require('mongoose');
import {UserModel} from '../data/models/Users';
import {GameModel} from '../data/models/Games';
import {IGame} from '../data/models/Games';
import {IUser} from '../data/models/Users';
let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	GameModel.create({}).then((game: IGame) => {
		console.log(game);
		UserModel.create({
			username: "pesho",
			salt: "123",
			hashPass: "asd",
			gameIds: [game._id]
		}).then((obj: IUser) => {
			res.send(200, obj);
		}, (err: any) => {

		console.error(err);
	});
	}, (err: any) => {
		console.error(err);
	});
});

export = router;
