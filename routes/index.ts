/// <reference path='../.d.ts' />

import * as express from 'express';
// import mongoose = require('mongoose');
import {UserModel} from '../data/models/Users';
import {IUser} from '../data/models/Users';
let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	UserModel.findByUsername('pesho', (err: any, user: IUser) => {
		res.send(200, user);
	});
});

export = router;
