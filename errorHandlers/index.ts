/// <reference path='../.d.ts' />

import * as express from 'express';

module.exports = (app: express.IRouter<express.Application>) => {
	app.use((req, res, next) => {
		let err: any = new Error('Page not found :sadpanda:');
		err['status'] = 404;
		res.send(err['status'], {
			message: err.message,
			error: err
		});
	});

	app.use((err: any, req: express.Request, res: express.Response) => {
		res.status(err['status'] || 500);
		res.send(err['status'], {
			message: err.message,
			error: err
		});
	});
};
