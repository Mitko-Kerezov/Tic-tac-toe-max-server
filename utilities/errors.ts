/// <reference path='../.d.ts' />
import * as express from 'express';
import {IUser} from 'Models';

export module Errors {
	export function sendErrorObject(res: express.Response, error: any): void {
		Errors.send(res, error.message, error.code || 500);
	}

	export function send(res: express.Response, errorMessage: string, errorCode?: number): void {
		let err: any = new Error(errorMessage);
		err['status'] = err['status'] || errorCode || 400;
		res.status(err['status']).send({
			message: err.message,
			error: err
		});
	}

	export function sendWebSocketError(ws: WebSocket, user: IUser, err: any) {
		err.username = user.username;
		ws.send(JSON.stringify(err));
	}
}
