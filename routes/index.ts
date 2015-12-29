/// <reference path='../.d.ts' />

import * as express from 'express';
import {UsersController} from '../controllers/usersController';
import {GamesController} from '../controllers/gamesController';
import {Authentication} from '../config/auth';

module.exports = (app: express.Application) => {
	app.post('/login', Authentication.login);
	app.get('/logout', Authentication.logout);

	app.post('/users', UsersController.postRegister);
	app.post('/games', Authentication.isAuthenticated, GamesController.postRegister);
};
