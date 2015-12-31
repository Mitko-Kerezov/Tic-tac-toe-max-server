/// <reference path='../.d.ts' />

import * as express from 'express';
import * as bodyParser from 'body-parser';

module.exports = (app: express.Application) => {
	app.use(bodyParser.urlencoded({extended:true}));
	app.use(bodyParser.json());
};
