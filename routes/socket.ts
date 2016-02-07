/// <reference path='../.d.ts' />

import {Constants} from '../constants';
import {IUser} from 'Models';
import {Errors} from '../utilities/errors';
import {debug} from '../utilities/debugging';
import {UserModel} from '../data/models/Users';
import {GamesController} from '../controllers/gamesController';
import * as jwt from 'jsonwebtoken';

// Attempts to use WebSocket's type Server here lead to compile error :()
module.exports = (server: any) => {
	server.on('connection', (ws: WebSocket) => {
			debug("Connection received");
			ws.onmessage = (message: MessageEvent) => {
				try {
					let webSocketMessage: IWebSocketMessage = JSON.parse(message.data);
					debug("Websocket message %s", JSON.stringify(webSocketMessage, null, 2));
					jwt.verify(webSocketMessage.token, Constants.JWTSecret, (err: any, user: IUser) => {
						if (err) {
							Errors.sendWebSocketError(ws, user, err);
							return;
						}

						UserModel.findById(user._id.toString(), (innerErr: any, userInDb: IUser) => {
							if (!userInDb) {
								Errors.sendWebSocketError(ws, user, innerErr || { message: Constants.AuthenticationRequired });
								return;
							}

							GamesController.makeMove(ws, webSocketMessage.data, userInDb);
						});
					});
				} catch	(err) {
					debug(err);
				}
			};

		});
};
