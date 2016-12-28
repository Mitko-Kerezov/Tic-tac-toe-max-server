/// <reference path='../.d.ts' />
import {ModelEnumerations} from '../data/models/ModelEnumerations';
import {ModelEnumerationOperations} from '../data/models/ModelEnumerationOperations';
import {ISmallBoard} from 'Models';

export module Validation {
	export function checkMakeMoveData(makeMoveData: IMakeMoveRequestData): boolean {
		return isBetween(makeMoveData.boardRow, 0, 4) &&
			isBetween(makeMoveData.boardCol, 0, 4) &&
			isBetween(makeMoveData.cellRow, 0, 2) &&
			isBetween(makeMoveData.cellCol, 0, 2);
	}

	export function getGameResult(board: { [id: number]: { [id: number]: ISmallBoard } }, currentBoardGameResult: string, currentBoardRow: number, currentBoardCol: number): string {
		let col = 0,
			row = 0,
			diag = 0,
			rdiag = 0;

		for (let i = 0; i < 3; ++i) {
			if (board[currentBoardRow][i].gameResult === currentBoardGameResult) {
				++col;
			}

			if (board[i][currentBoardCol].gameResult === currentBoardGameResult) {
				++row;
			}

			if (board[i][i].gameResult === currentBoardGameResult) {
				++diag;
			}

			if (board[i][2 - i].gameResult === currentBoardGameResult) {
				++rdiag;
			}
		}

		if (col === 3 || row === 3 || diag === 3 || rdiag === 3) {
			return currentBoardGameResult;
		}

		let isDraw = true;
		for (let outerKey in board) {
			for (let innerKey in board[outerKey]) {
				if (board[outerKey][innerKey].gameResult === ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING)) {
					isDraw = false;
				}
			}
		}

		return isDraw ?
			ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.DRAW) :
			ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING);
	}

	export function getSmallBoardGameResult(tiles: string[][], currentPlayerSymbol: string, currentPlayerRow: number, currentPlayerCol: number): string {
		let col = 0,
			row = 0,
			diag = 0,
			rdiag = 0;

		for (let i = 0; i < 3; ++i) {
			if (tiles[currentPlayerRow][i] === currentPlayerSymbol) {
				++col;
			}

			if (tiles[i][currentPlayerCol] === currentPlayerSymbol) {
				++row;
			}

			if (tiles[i][i] === currentPlayerSymbol) {
				++diag;
			}

			if (tiles[i][2 - i] === currentPlayerSymbol) {
				++rdiag;
			}
		}

		if (col === 3 || row === 3 || diag === 3 || rdiag === 3) {
			return ModelEnumerationOperations.getGameResultByPlayerLetterAsString(currentPlayerSymbol);
		}

		if (!tiles.filter(innerTiles => !!innerTiles.filter(tile => !tile).length).length) {
			return ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.DRAW);
		}

		return ModelEnumerationOperations.gameResultAsString(ModelEnumerations.GameResult.STILL_PLAYING);
	}

	function isBetween(num: number, lowerBoundInclusive: number, upperBoundInclusive: number): boolean {
		return lowerBoundInclusive <= num && num <= upperBoundInclusive;
	}
};
