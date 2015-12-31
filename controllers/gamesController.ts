/// <reference path='../.d.ts' />

import * as express from 'express';
import {Errors} from '../utilities/errors';
import {Validation} from '../utilities/validation';
import {UserModel} from '../data/models/Users';
import {GameModel} from '../data/models/Games';
import * as Models from 'Models';
import {ModelEnumerationOperations} from '../data/models/ModelEnumerationOperations';
import {ModelEnumerations} from '../data/models/ModelEnumerations';
import {Constants} from "../constants";
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

			let result = games.map((game:any) => {
				return {
					id: game._id,
					username: game.users[1].username
				}
			})
			res.status(200).send(result);
		});
	}

	export function postJoin(req: express.Request, res: express.Response): void {
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
							res.status(204).send({});
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

	export function makeMove(ws: WebSocket, makeMoveRequestData: IMakeMoveRequestData, currentUser: Models.IUser): void {
		debug('User %s attempts to make a move %s', currentUser.username, JSON.stringify(makeMoveRequestData));
		let getResponse = (message: string, isError: boolean, gameBoard?: { [id: number] : { [id: number] : Models.ISmallBoard } }) => {
			ws.send(JSON.stringify({
				username: currentUser.username,
				message: message,
				isError: isError,
				gameBoard: gameBoard
			}));
		};

		if (!Validation.checkMakeMoveData(makeMoveRequestData)) {
			getResponse('Invalid move - index out of bounds', true);
			return;
		}

		let userGame = currentUser.games.filter((game: Models.IUserGame) => game.gameId === makeMoveRequestData.gameId)[0];
		if (!userGame) {
			getResponse('Current user is not involved in this game', true);
			return;
		}

		GameModel.findById(userGame.gameId, (err: any, game: Models.IGame) => {
			if (err) {
				getResponse(err.message, true);
				return;
			}

			if (!game) {
				getResponse('Game does not exist', true);
				return;
			}

			if (game.gameResult !== ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING)) {
				getResponse('Game is over', true);
				return;
			}

			// if (game.canJoin || !game.users[2]) {
			// 	getResponse('Current game has not yet started');
			// 	return;
			// }

			if (game.users[1].id !== currentUser._id.toString() && game.users[2].id !== currentUser._id.toString()) {
				getResponse('Current user is not involved in this game', true);
				return;
			}

			if (game.currentPlayerSymbol !== userGame.playerSymbol) {
				getResponse("Cannot make a move - not this player's turn", true);
				return;
			}

			if ((game.currentPlayingBoardRow !== Constants.PlayAnyWhere && game.currentPlayingBoardCol !== Constants.PlayAnyWhere &&
				game.currentPlayingBoardRow !== makeMoveRequestData.boardRow && game.currentPlayingBoardCol !== makeMoveRequestData.boardCol) ||
				game.board[makeMoveRequestData.boardRow][makeMoveRequestData.boardCol].gameResult !== ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING)) {
				getResponse('Cannot make a move on that board', true);
				return;
			}

			let currentSmallBoard = game.board[makeMoveRequestData.boardRow][makeMoveRequestData.boardCol];

			if (currentSmallBoard.tiles[makeMoveRequestData.cellRow][makeMoveRequestData.cellCol]) {
				getResponse('Cannot make a move there - cell already taken', true);
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
					getResponse(innerError.message, true);
					return;
				}

				if (isGameWon) {
					UserModel.findByIdAndUpdate(currentUser._id.toString(), { $inc: { "wins": 1 } }, (userErr: any, user: Models.IUser) => {
						if (userErr) {
							getResponse(userErr.message, true);
							return;
						} else {
							debug('User %s won a game', currentUser.username);
							getResponse('Game over: WINNER', false, updatedGame.board);
							return;
						}
					});
				} else if (isGameDraw) {
					getResponse('Game over: DRAW', false, updatedGame.board);
				} else {
					getResponse('Move made', false, updatedGame.board);
				}
				// notify other user
			});
		});
	}
};
