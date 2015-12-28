/// <reference path='../.d.ts' />

import * as express from 'express';
import {UsersController} from '../controllers/usersController';
import {GamesController} from '../controllers/gamesController';
import * as bodyParser from 'body-parser';

module.exports = (app: express.IRouter<express.Application>) => {
	app.use(bodyParser.urlencoded({extended:true}));
	app.use(bodyParser.json());

	app.post('/users', UsersController.postRegister);
	app.post('/games', GamesController.postRegister);
};
