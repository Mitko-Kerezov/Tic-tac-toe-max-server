/// <reference path='../../.d.ts' />

import {ModelEnumerations} from './ModelEnumerations';

export module ModelEnumerationOperations {
	export function gameResultAsString(gameResult: ModelEnumerations.GameResult): string {
		switch (gameResult) {
			case ModelEnumerations.GameResult.DRAW:
				return 'Draw';
			case ModelEnumerations.GameResult.STILL_PLAYING:
				return 'Still playing';
			case ModelEnumerations.GameResult.WON_BY_O:
				return 'Won by O';
			case ModelEnumerations.GameResult.WON_BY_X:
				return 'Won by X';
			default:
				throw new Error('Forgot to implement something about GameResult again, eh?');
		}
	}

	export function playerLetterAsString(playerLetter: ModelEnumerations.PlayerLetters): string {
		switch (playerLetter) {
			case ModelEnumerations.PlayerLetters.O:
				return 'O';
			case ModelEnumerations.PlayerLetters.X:
				return 'X';
			default:
				throw new Error('Forgot to implement something about PlayerLetters again, eh?');
		}
	}

	export function getRandomPlayerLetterAsString(): string {
		return playerLetterAsString(~~(Math.random() * 2) ? ModelEnumerations.PlayerLetters.O : ModelEnumerations.PlayerLetters.X);
	}

	export function inversePlayerLetterAsString(playerLetter: string): string {
		return playerLetterAsString(playerLetter === playerLetterAsString(ModelEnumerations.PlayerLetters.X) ? ModelEnumerations.PlayerLetters.O : ModelEnumerations.PlayerLetters.X);
	}

	export function getGameResultByPlayerLetterAsString(playerLetter: string): string {
		return gameResultAsString(playerLetter === playerLetterAsString(ModelEnumerations.PlayerLetters.X) ? ModelEnumerations.GameResult.WON_BY_X : ModelEnumerations.GameResult.WON_BY_O);
	}
}
