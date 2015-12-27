/// <reference path='./typings/tsd.d.ts' />

import * as express from 'express';
import * as http from 'http';
import * as debugModule from 'debug';
import * as routes from './routes/index';

let env = process.env.NODE_ENV || 'development';
let config = require('./config/config')[env];
let app = express();
let server = http.createServer(app);
let debug = debugModule('Tic-Tac-Toe-Max:server');

require('./config/mongoose')(config.db);

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

app.set('port', config.port);

server.listen(config.port);
server.on('listening', () => {
	let addr = server.address();
	let bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
});
