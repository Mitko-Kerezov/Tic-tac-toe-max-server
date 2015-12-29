/// <reference path='../.d.ts' />

import * as express from 'express';
import {Errors} from '../utilities/errors';
import {UserModel} from '../data/models/Users';
import {GameModel} from '../data/models/Games';
import * as Models from 'Models';
import {ModelEnumerationOperations} from '../data/models/ModelEnumerationOperations';
import {debug} from '../utilities/debugging';

export module GamesController {
	export function postRegister(req: express.Request, res: express.Response, next: Function): void {
		GameModel.create({
			currentPlayerSymbol: ModelEnumerationOperations.getRandomPlayerLetterAsString()
		}).then((createdGame: Models.IGame) => {
			debug('User %s created a game', req.user.username);
			res.status(201).send(createdGame);
			let userGame: Models.IUserGame = {
				gameId: createdGame._id,
				playerSymbol: ModelEnumerationOperations.getRandomPlayerLetterAsString()
			};

			UserModel.findByIdAndUpdate(req.user._id, { $push: { "games": userGame } }, (err: any, user: Models.IUser) => {
				console.log(user);
			});
		}, (err: any) => {
			Errors.send(res, err.message, err.code || 500);
		});
	}
};
