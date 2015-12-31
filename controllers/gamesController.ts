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
	export function postCreate(req: express.Request, res: express.Response, next: Function): void {
		GameModel.create({
			currentPlayerSymbol: ModelEnumerationOperations.getRandomPlayerLetterAsString(),
			userIds: [req.user._id]
		}).then((createdGame: Models.IGame) => {
			let userGame: Models.IUserGame = {
				gameId: createdGame._id.toString(),
				playerSymbol: ModelEnumerationOperations.getRandomPlayerLetterAsString()
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
		let getResponse = (message: string) => {
			ws.send(JSON.stringify({
				username: currentUser.username,
				message: message
			}));
		};

		if (!Validation.checkMakeMoveData(makeMoveRequestData)) {
			getResponse('Invalid move - index out of bounds');
			return;
		}

		let userGame = currentUser.games.filter((game: Models.IUserGame) => game.gameId === makeMoveRequestData.gameId)[0];
		if (!userGame) {
			getResponse('Current user is not involved in this game');
			return;
		}

		GameModel.findById(userGame.gameId, (err: any, game: Models.IGame) => {
			if (err) {
				getResponse(err.message);
				return;
			}

			if (!game || !~game.userIds.indexOf(currentUser._id.toString())) {
				getResponse('Current user is not involved in this game');
				return;
			}

			if (game.gameResult !== ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING)) {
				getResponse('Current game is over');
				return;
			}

			// if (game.canJoin) {
			// 	getResponse('Current game has not yet started');
			// 	return;
			// }

			if (game.currentPlayerSymbol !== userGame.playerSymbol) {
				getResponse("Cannot make a move - not this player's turn");
				return;
			}

			if ((game.currentPlayingBoardRow !== Constants.PlayAnyWhere && game.currentPlayingBoardCol !== Constants.PlayAnyWhere &&
				game.currentPlayingBoardRow !== makeMoveRequestData.boardRow && game.currentPlayingBoardCol !== makeMoveRequestData.boardCol) ||
				game.board[makeMoveRequestData.boardRow][makeMoveRequestData.boardCol].gameResult !== ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING)) {
				getResponse('Cannot make a move on that board');
				return;
			}

			let currentSmallBoard = game.board[makeMoveRequestData.boardRow][makeMoveRequestData.boardCol];

			if (currentSmallBoard.tiles[makeMoveRequestData.cellRow][makeMoveRequestData.cellCol]) {
				getResponse('Cannot make a move there - cell already taken');
				return;
			}

			currentSmallBoard.tiles[makeMoveRequestData.cellRow][makeMoveRequestData.cellCol] = userGame.playerSymbol;
			currentSmallBoard.gameResult = Validation.getSmallBoardGameResult(currentSmallBoard.tiles,
				userGame.playerSymbol,
				makeMoveRequestData.cellRow,
				makeMoveRequestData.cellCol);

			game.board[makeMoveRequestData.boardRow][makeMoveRequestData.boardCol] = currentSmallBoard;
			let updateObject: any = {};
			let isGameDraw: boolean = false;
			let isGameWon: boolean = false;
			updateObject[`board.${makeMoveRequestData.boardRow}.${makeMoveRequestData.boardCol}`] = currentSmallBoard;
			updateObject["currentPlayerSymbol"] = ModelEnumerationOperations.inversePlayerLetterAsString(userGame.playerSymbol);
			if (currentSmallBoard.gameResult !== ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING)) {
				let newGameResult = Validation.getGameResult(game.board,
					currentSmallBoard.gameResult,
					makeMoveRequestData.boardRow,
					makeMoveRequestData.boardCol);

				if (newGameResult !== ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING)) {
					updateObject["gameResult"] = newGameResult;
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

			updateObject["currentPlayingBoardRow"] = targetGameBoardRow;
			updateObject["currentPlayingBoardCol"] = targetGameBoardCol;

			GameModel.findByIdAndUpdate(userGame.gameId, { $set: updateObject }, (innerError: any, updatedGame: Models.IGame) => {
				if (innerError) {
					getResponse(innerError.message);
					return;
				}

				if (isGameWon) {
					UserModel.findByIdAndUpdate(currentUser._id.toString(), { $inc: { "wins": 1 } }, (userErr: any, user: Models.IUser) => {
						if (userErr) {
							getResponse(userErr.message);
							return;
						} else {
							debug('User %s won a game', currentUser.username);
							getResponse('Game over: WINNER');
							return;
						}
					});
				} else if (isGameDraw) {
					getResponse('Game over: DRAW');
				} else {
					getResponse('Move made');
				}
				// notify other user
			});
		});
	}
};
