/// <reference path='../.d.ts' />

import {Server} from 'ws';

module.exports = (server: Server) => {
	server.on("connection", (ws) => {
		var id = setInterval(function() {
			ws.send(JSON.stringify(new Date()), function() { })
		}, 1000)

		console.log("websocket connection open")

		ws.on("close", function() {
			console.log("websocket connection close")
			clearInterval(id)
		});

		ws.onmessage = (event: any) => {
			console.log(event.data);
		};
	})
};
