/// <reference path='../.d.ts' />

import * as express from 'express';
import {UsersController} from '../controllers/usersController';
import {GamesController} from '../controllers/gamesController';
import {Authentication} from '../config/auth';

module.exports = (app: express.Application) => {
	app.post('/login', Authentication.login);
	app.get('/logout', Authentication.isAuthenticated, Authentication.logout);

	app.post('/register', UsersController.postRegister);
	app.post('/create', Authentication.isAuthenticated, GamesController.postRegister);
	app.post('/move', Authentication.isAuthenticated, GamesController.makeMove);
};
