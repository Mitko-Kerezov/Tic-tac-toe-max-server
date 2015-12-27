/// <reference path='../typings/tsd.d.ts' />

import * as express from 'express';
let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	res.send(200, {name: "pesho"});
});

export = router;
