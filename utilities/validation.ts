/// <reference path='../.d.ts' />

let allowedSymbols = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789_ .';
export module Validation {
	export function checkUsername(username: string) {
		if (!username || !username.length) {
			return false;
		}

		for(let i = 0, len = username.length; i < len; ++i) {
			if (!~allowedSymbols.indexOf(username[i])) {
				return false;
			}
		}

		return true;
	}
};
