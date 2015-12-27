/// <reference path='../typings/tsd.d.ts' />

import * as crypto from 'crypto';

module.exports = {
	generateSalt: () => crypto.randomBytes(128).toString('base64'),
	generateHashedPassword: (salt: string, pwd: string) => {
		let hmac = crypto.createHmac('sha1', salt);
		return hmac.update(pwd).digest('hex');
	}
};
