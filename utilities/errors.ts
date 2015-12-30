/// <reference path='../.d.ts' />
import * as express from 'express';

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
}
