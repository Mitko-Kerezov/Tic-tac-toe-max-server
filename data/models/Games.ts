/// <reference path='../../.d.ts' />

import mongoose = require('mongoose');
import {IGame} from 'Models';
import {Constants} from "../../constants";

function getEmptyBoard(): any[] {
	let nineEmptyTiles = Array.apply(null, Array(3)).map(() => Array.apply(null, Array(3)).map(() => ''));
	let result: any = {};
	Array.apply(null, Array(3)).forEach((el: any, upperIndex: number) => {
		result[upperIndex] = {};
		Array.apply(null, Array(3)).forEach((elem: any, lowerIndex: number) => {
			result[upperIndex][lowerIndex] = {
				tiles: nineEmptyTiles,
				gameResult: 'Still playing'
			};
		});
	});

	return result;
}

export let gameSchema: mongoose.Schema = new mongoose.Schema({
	board: {type: Object, default: getEmptyBoard()},
	canJoin: { type: Boolean, default: true },
	gameResult: { type: String, enum: ['Still playing', 'Won by O', 'Won by X', 'Draw'], default: 'Still playing' },
	// 3 means you can play wherever you want
	currentPlayingBoardRow: { type: Number, validate: [/[0-3]/, 'current playing board should be a one digit number'], default: Constants.PlayAnyWhere},
	currentPlayingBoardCol: { type: Number, validate: [/[0-3]/, 'current playing board should be a one digit number'], default: Constants.PlayAnyWhere },
	currentPlayerSymbol: {type: String, enum: ['X', 'O'], required: true }
});

export let GameModel = mongoose.model<IGame>('Game', gameSchema);
