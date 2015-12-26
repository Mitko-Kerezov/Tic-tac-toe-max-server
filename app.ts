/// <reference path='./typings/tsd.d.ts' />

import express = require('express');
import http = require('http');
import debugModule = require('debug');
import routes = require('./routes/index');

let app = express();
let server = http.createServer(app);
let port = process.env.PORT || '1234';
let debug = debugModule('Tic-Tac-Toe-Max:server');

app.use('/', routes);

app.use((req, res, next) => {
	let err: any = new Error('Not Found');
	err['status'] = 404;
	next(err);
});

app.use((err: any, req: express.Request, res: express.Response) => {
	res.status(err['status'] || 500);
	res.render('error', {
		message: err.message,
		error: err
	});
});

app.set('port', port);
server.listen(port);
server.on('listening', () => {
	let addr = server.address();
	let bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
});
