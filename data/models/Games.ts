/// <reference path='../../.d.ts' />

import mongoose = require('mongoose');
import {IGame} from 'Models';

function getEmptyBoard(): any[] {
	// This initializes 9 tic-tac-toe boards filled with zeroes
	return Array.apply(null, Array(9)).map(() =>
			Array.apply(null, Array(3)).map(() =>
				Array.apply(null, Array(3)).map(() => 0)));
}

export let gameSchema: mongoose.Schema = new mongoose.Schema({
		board: {type: Array, default: getEmptyBoard()},
		isOver: {type: Boolean, default: false},
		gameResult: {type: String, enum: ['Still playing', 'Won by O', 'Won by X', 'Draw'], default: 'Still playing'},
		currentPlayingBoard: {type: Number, validate: [/\d/, 'current playing board should be a one digit number'], default: 0},
		currentPlayerSymbol: {type: String, enum: ['x', 'o'], default: 'x'}
	});


export let GameModel = mongoose.model<IGame>('Game', gameSchema);
