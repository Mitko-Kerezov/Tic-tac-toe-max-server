/// <reference path='../.d.ts' />

import * as express from 'express';
import * as passport from 'passport';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';

module.exports = (app: express.Application) => {
	app.use(bodyParser.urlencoded({extended:true}));
	app.use(bodyParser.json());

	// app.use(cookieParser());
	// app.use(busboy({immediate: false}));

	app.use(session({secret: 'half live 3 confirmed', resave: true, saveUninitialized: true}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(function(req, res, next) {
		if (req.session['error']) {
			var msg = req.session['error'];
			req.session['error'] = undefined;
			app.locals.errorMessage = msg;
		}
		else {
			app.locals.errorMessage = undefined;
		}

		next();
	});
	app.use(function(req, res, next) {
		if (req.session['success']) {
			var msg = req.session['success'];
			req.session['success'] = undefined;
			app.locals.successMessage = msg;
		}
		else {
			app.locals.successMessage = undefined;
		}

		next();
	});
	app.use(function(req, res, next) {
		if (req.user) {
			app.locals.currentUser = req.user;
		}
		else {
			app.locals.currentUser = undefined;
		}

		next();
	});
};
