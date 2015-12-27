/// <reference path='../.d.ts' />

import mongoose = require('mongoose');

module.exports = (uri: string) => {
	mongoose.connect(uri);
	let db = mongoose.connection;

	db.once('open', (err: any) => {
		if (err) {
			console.error('Database could not be opened: ' + err);
			return;
		}

		console.log('Database up and running...');
	});

	db.on('error', (err: any) => {
		console.error('Database error: ' + err);
	});
};
