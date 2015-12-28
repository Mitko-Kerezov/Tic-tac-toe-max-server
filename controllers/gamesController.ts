/// <reference path='../.d.ts' />

import * as express from 'express';
import {Errors} from '../utilities/errors';
import {GameModel} from '../data/models/Games';
import {IGame} from '../data/models/Games';

export module GamesController {
	export function postRegister(req: express.Request, res: express.Response, next: Function): void {
		GameModel.create({}).then((createdGame: IGame) => {
			res.status(201).send(createdGame);
		}, (err: any) => {
			Errors.send(res, err.message, err.code || 500);
		});
	}
};
