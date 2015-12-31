/// <reference path='../.d.ts' />

import {Server} from 'ws';
import {Constants} from '../constants';
import {IUser} from 'Models';
import {Errors} from '../utilities/errors';
import {debug} from '../utilities/debugging';
import {UserModel} from '../data/models/Users';
import {GamesController} from '../controllers/gamesController';
import * as jwt from 'jsonwebtoken';

module.exports = (server: any) => {
	server.on('connection', (ws: WebSocket) => {

			ws.onmessage = (message: MessageEvent) => {
				try {
					let webSocketMessage: IWebSocketMessage = JSON.parse(message.data);
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

							switch (webSocketMessage.purpose) {
								case "move":
									GamesController.makeMove(ws, webSocketMessage.data, userInDb);
									break;

								default:
									ws.send(JSON.stringify({
										message: 'Invalid purpose',
										username: user.username
									}));
							}
						})
					});
				} catch	(err) {
					debug(err);
				}
			};

		});
};
