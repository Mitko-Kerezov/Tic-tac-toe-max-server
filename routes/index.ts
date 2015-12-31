/// <reference path='../.d.ts' />

import * as express from 'express';
import {UsersController} from '../controllers/usersController';
import {GamesController} from '../controllers/gamesController';
import {Authentication} from '../config/auth';

module.exports = (app: express.Application) => {
	app.post('/login', Authentication.login);

	app.post('/register', UsersController.postRegister);
	app.post('/create', Authentication.isAuthenticated, GamesController.postCreate);
	app.post('/join', Authentication.isAuthenticated, GamesController.postJoin);
};
