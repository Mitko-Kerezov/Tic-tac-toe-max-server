/// <reference path='./typings/tsd.d.ts' />

import * as express from 'express';
import * as http from 'http';
import * as debugModule from 'debug';

let env = process.env.NODE_ENV || 'development';
let config = require('./config/config')[env];
let app = express();
let server = http.createServer(app);
let debug = debugModule('Tic-Tac-Toe-Max:server');

require('./config/express')(app);
require('./config/mongoose')(config.db);
require('./routes')(app);
require('./errorHandlers')(app);
require('./config/passport')(app);

app.set('port', config.port);

server.listen(config.port);
server.on('listening', () => {
	let addr = server.address();
	let bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
});
