/// <reference path='../.d.ts' />

import * as crypto from 'crypto';

export function generateSalt() {
	return crypto.randomBytes(128).toString('base64');
}

export function generateHashedPassword(salt: string, pwd: string) {
	let hmac = crypto.createHmac('sha1', salt);
	return hmac.update(pwd).digest('hex');
}
