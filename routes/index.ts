/// <reference path='../.d.ts' />

import * as express from 'express';
import {UsersController} from '../controllers/usersController';
import {GamesController} from '../controllers/gamesController';
import {Server} from 'ws';
import {Authentication} from '../config/auth';

module.exports = (app: express.Application, webSocketServer: Server) => {
	app.post('/fblogin', Authentication.fbLogin);
	app.post('/login', Authentication.login);

	app.post('/register', UsersController.postRegister);
	app.post('/create', Authentication.isAuthenticated, GamesController.postCreate);

	app.get('/status', Authentication.isAuthenticated, UsersController.getStatus);

	app.get('/join', Authentication.isAuthenticated, GamesController.getCanJoin);
	app.post('/join', Authentication.isAuthenticated, (req: express.Request, res: express.Response) => {
		GamesController.postJoin(req, res, webSocketServer);
	});
};
