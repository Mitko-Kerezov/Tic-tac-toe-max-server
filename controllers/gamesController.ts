/// <reference path='../.d.ts' />

import * as express from 'express';
import * as util from 'util';
import {Errors} from '../utilities/errors';
import {Validation} from '../utilities/validation';
import {UserModel} from '../data/models/Users';
import {GameModel} from '../data/models/Games';
import * as Models from 'Models';
import {ModelEnumerationOperations} from '../data/models/ModelEnumerationOperations';
import {ModelEnumerations} from '../data/models/ModelEnumerations';
import {Constants} from "../constants";
import {Server} from 'ws';
import {debug} from '../utilities/debugging';

export module GamesController {
	export function getCanJoin(req: express.Request, res: express.Response): void {
		GameModel.find({
			"canJoin": true,
			"users.1.id": { $ne: req.user._id.toString() }

		}, "_id, users.1.username", (err: any, games: any) => {
			if (err) {
				Errors.sendErrorObject(res, err);
				return;
			}

			let result = games.map((game: any) => {
				return {
					id: game._id,
					username: game.users[1].username
				};
			});

			res.status(200).send(result);
		});
	}

	export function postJoin(req: express.Request, res: express.Response, webSocketServer: Server): void {
		let gameReference: IGameReference = req.body;
		let userId: string = req.user._id.toString();
		GameModel.findById(gameReference.gameId, (err: any, game: Models.IGame) => {
			if (!game) {
				Errors.sendErrorObject(res, err || { message: 'Game does not exist', code: 400 });
				return;
			}

			if (game.users[1].id === userId) {
				Errors.send(res, 'Current user is already part of that game');
				return;
			}

			if (!game.canJoin) {
				Errors.send(res, 'Game already full');
				return;
			}

			let updateObject: any = {};
			updateObject['$set'] = {
				"canJoin": false,
				"users.2": {
					username: req.user.username,
					id: userId
				}
			};

			GameModel.findByIdAndUpdate(gameReference.gameId, updateObject, (innerGameErr: any, updatedGame: Models.IGame) => {
				if (innerGameErr) {
					Errors.sendErrorObject(res, innerGameErr);
				} else {
					let userGame: Models.IUserGame = {
						gameId: gameReference.gameId,
						playerSymbol: ModelEnumerationOperations.playerLetterAsString(ModelEnumerations.PlayerLetters.O)
					};

					UserModel.findByIdAndUpdate(userId, { $push: { "games": userGame } }, (innerUserErr: any, user: Models.IUser) => {
						if (innerUserErr) {
							Errors.sendErrorObject(res, innerUserErr);
						} else {
							debug('User %s joined game with id %s', req.user.username, gameReference.gameId);
							getResponse(webSocketServer, null, util.format("%s joined the game", req.user.username), false, [game.users[1].username]);
							res.status(200).send(updatedGame);
						}
					});
				}
			});
		});
	}

	export function postCreate(req: express.Request, res: express.Response): void {
		GameModel.create({
			currentPlayerSymbol: ModelEnumerationOperations.getRandomPlayerLetterAsString(),
			users: {
				'1': {
					username: req.user.username,
					id: req.user._id.toString()
				}
			}
		}).then((createdGame: Models.IGame) => {
			let userGame: Models.IUserGame = {
				gameId: createdGame._id.toString(),
				playerSymbol: ModelEnumerationOperations.playerLetterAsString(ModelEnumerations.PlayerLetters.X)
			};

			UserModel.findByIdAndUpdate(req.user._id, { $push: { "games": userGame } }, (err: any, user: Models.IUser) => {
				if (err) {
					Errors.sendErrorObject(res, err);
				} else {
					debug('User %s created a game', req.user.username);
					res.status(201).send(createdGame);
				}
			});
		}, (err: any) => {
			Errors.send(res, err);
		});
	}

	export function makeMove(ws: WebSocket, makeMoveRequestData: IMakeMoveRequestData, currentUser: Models.IUser, webSocketServer: Server): void {
		debug('User %s attempts to make a move %s', currentUser.username, JSON.stringify(makeMoveRequestData));
		let currentUserIdString = currentUser._id.toString();

		if (!Validation.checkMakeMoveData(makeMoveRequestData)) {
			getResponse(webSocketServer, ws, 'Invalid move - index out of bounds', true, [currentUser.username]);
			return;
		}

		let userGame = currentUser.games.filter((game: Models.IUserGame) => game.gameId === makeMoveRequestData.gameId)[0];
		if (!userGame) {
			getResponse(webSocketServer, ws, 'Current user is not involved in this game', true, [currentUser.username]);
			return;
		}

		GameModel.findById(userGame.gameId, (err: any, game: Models.IGame) => {
			if (err) {
				getResponse(webSocketServer, ws, err.message, true, [currentUser.username]);
				return;
			}

			if (!game) {
				getResponse(webSocketServer, ws, 'Game does not exist', true, [currentUser.username]);
				return;
			}

			if (game.gameResult !== ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING)) {
				getResponse(webSocketServer, ws, 'Game is over', true, [currentUser.username]);
				return;
			}

			if (game.canJoin || !game.users[2]) {
				getResponse(webSocketServer, ws, 'Current game has not yet started', true, [currentUser.username]);
				return;
			}

			if (game.users[1].id !== currentUserIdString && game.users[2].id !== currentUserIdString) {
				getResponse(webSocketServer, ws, 'Current user is not involved in this game', true, [currentUser.username]);
				return;
			}

			if (game.currentPlayerSymbol !== userGame.playerSymbol) {
				getResponse(webSocketServer, ws, "Cannot make a move - not this player's turn", true, [currentUser.username]);
				return;
			}

			if ((game.currentPlayingBoardRow !== makeMoveRequestData.boardRow && game.currentPlayingBoardRow !== Constants.PlayAnyWhere) ||
				(game.currentPlayingBoardCol !== makeMoveRequestData.boardCol && game.currentPlayingBoardCol !== Constants.PlayAnyWhere)) {
				getResponse(webSocketServer, ws, "That's not the target board", true, [currentUser.username]);
				return;
			}

			if (game.board[makeMoveRequestData.boardRow][makeMoveRequestData.boardCol].gameResult !== ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING)) {
				getResponse(webSocketServer, ws, 'This board is already finished', true, [currentUser.username]);
				return;
			}

			let currentSmallBoard = game.board[makeMoveRequestData.boardRow][makeMoveRequestData.boardCol];

			if (currentSmallBoard.tiles[makeMoveRequestData.cellRow][makeMoveRequestData.cellCol]) {
				getResponse(webSocketServer, ws, 'Cannot make a move there - cell already taken', true, [currentUser.username]);
				return;
			}

			currentSmallBoard.tiles[makeMoveRequestData.cellRow][makeMoveRequestData.cellCol] = userGame.playerSymbol;
			currentSmallBoard.gameResult = Validation.getSmallBoardGameResult(currentSmallBoard.tiles,
				userGame.playerSymbol,
				makeMoveRequestData.cellRow,
				makeMoveRequestData.cellCol);

			game.board[makeMoveRequestData.boardRow][makeMoveRequestData.boardCol] = currentSmallBoard;
			let setUpdateObject: any = {};
			let isGameDraw: boolean = false;
			let isGameWon: boolean = false;
			setUpdateObject[`board.${makeMoveRequestData.boardRow}.${makeMoveRequestData.boardCol}`] = currentSmallBoard;
			setUpdateObject["currentPlayerSymbol"] = ModelEnumerationOperations.inversePlayerLetterAsString(userGame.playerSymbol);
			if (currentSmallBoard.gameResult !== ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING)) {
				let newGameResult = Validation.getGameResult(game.board,
					currentSmallBoard.gameResult,
					makeMoveRequestData.boardRow,
					makeMoveRequestData.boardCol);

				if (newGameResult !== ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING)) {
					setUpdateObject["gameResult"] = newGameResult;
					isGameDraw = newGameResult === ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.DRAW);
					isGameWon = !isGameDraw;
				}
			}

			let targetGameBoardGameResult = game.board[makeMoveRequestData.cellRow][makeMoveRequestData.cellCol].gameResult;
			let targetGameBoardRow = targetGameBoardGameResult === ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING) ?
				makeMoveRequestData.cellRow :
				Constants.PlayAnyWhere;
			let targetGameBoardCol = targetGameBoardGameResult === ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING) ?
				makeMoveRequestData.cellCol :
				Constants.PlayAnyWhere;

			setUpdateObject["currentPlayingBoardRow"] = targetGameBoardRow;
			setUpdateObject["currentPlayingBoardCol"] = targetGameBoardCol;

			GameModel.findByIdAndUpdate(userGame.gameId, { $set: setUpdateObject }, { new: true }, (innerError: any, updatedGame: Models.IGame) => {
				if (innerError) {
					getResponse(webSocketServer, ws, innerError.message, true, [currentUser.username]);
					return;
				}

				let otherUserIndex = updatedGame.users[1].id === currentUserIdString ? 2 : 1;
				if (isGameWon) {
					UserModel.findByIdAndUpdate(currentUserIdString, { $inc: { "wins": 1 } }, (userErr: any, user: Models.IUser) => {
						if (userErr) {
							getResponse(webSocketServer, ws, userErr.message, true, [currentUser.username]);
							return;
						}

						debug('User %s WON game %s', user.username, userGame.gameId);
						getResponse(webSocketServer, ws, 'Game over: WINNER', false, [currentUser.username], updatedGame.board);
					});

					UserModel.findByIdAndUpdate(updatedGame.users[otherUserIndex].id, { $inc: { "losses": 1 } }, (userErr: any, user: Models.IUser) => {
						if (userErr) {
							getResponse(webSocketServer, ws, userErr.message, true, [currentUser.username]);
							return;
						}

						debug('User %s lost game %s', user.username, userGame.gameId);
						getResponse(webSocketServer, ws, 'Game over: LOSER', false, [user.username], updatedGame.board);
					});
				} else if (isGameDraw) {
					getResponse(webSocketServer, ws, 'Game over: DRAW', false, [updatedGame.users[otherUserIndex].username, currentUser.username], updatedGame.board);
				} else {
					debug('User %s made move successfully', currentUser.username);
					getResponse(webSocketServer, ws,
						'Move made',
						false,
						[updatedGame.users[otherUserIndex].username, currentUser.username],
						updatedGame.board,
						{
							row: updatedGame.currentPlayingBoardRow,
							col: updatedGame.currentPlayingBoardCol
						},
						updatedGame.currentPlayerSymbol);
				}
			});
		});
	}

	function getResponse(server: Server,
		ws: WebSocket,
		message: string,
		isError: boolean,
		usernames: string[],
		board?: { [id: number]: { [id: number]: Models.ISmallBoard } },
		nextBoard?: {row: number, col: number},
		currentPlayerSymbol?: string) {
			let messageObject = {
				usernames: usernames,
				message: message,
				isError: isError,
				board: board,
				nextBoard: nextBoard,
				currentPlayerSymbol: currentPlayerSymbol
			};

			if (isError && ws) {
				ws.send(JSON.stringify(messageObject));
			} else {
				server.clients.forEach(client => {
					client.send(JSON.stringify(messageObject));
				});
			}
	};
};
