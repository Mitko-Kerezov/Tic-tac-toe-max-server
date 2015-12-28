/// <reference path='../../.d.ts' />

import mongoose = require('mongoose');

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
		currentPlayer: {type: String, enum: ['x', 'o'], default: 'x'}
	});

export enum GameResult {'Still playing', 'Won by O', 'Won by X', 'Draw'};
export enum PlayerLetter {'x', 'o'};

export interface IGame extends mongoose.Document {
	board: any[];
	isOver: boolean;
	gameResult: GameResult;
	currentPlayingBoard: number;
	currentPlayer: PlayerLetter;
}

export let GameModel = mongoose.model<IGame>('Game', gameSchema);
