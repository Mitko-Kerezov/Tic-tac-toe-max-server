/// <reference path='../.d.ts' />

import * as express from 'express';
import * as passport from 'passport';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';

module.exports = (app: express.Application) => {
	app.use(bodyParser.urlencoded({extended:true}));
	app.use(bodyParser.json());

	app.use(session({secret: 'half live 3 confirmed', resave: true, saveUninitialized: true}));
	app.use(passport.initialize());
	app.use(passport.session());
};
