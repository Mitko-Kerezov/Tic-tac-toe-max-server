/// <reference path='./typings/tsd.d.ts' />

interface IUserRequestData {
username: string;
password: string;
confirmPassword: string;
}

interface IGameReference {
gameId: string;
}

interface IMakeMoveRequestData extends IGameReference {
boardRow: number;
boardCol: number;
cellRow: number;
cellCol: number;
}

interface IWebSocketMessage {
token: string;
data: any;
}

declare module 'Models' {
import mongoose = require('mongoose');

export interface IGame extends mongoose.Document {
board: { [id: number] : { [id: number] : ISmallBoard } };
canJoin: boolean;
gameResult: string;
users: { [id: number] : { username : string, id: string } };
currentPlayingBoardRow: number;
currentPlayingBoardCol: number;
currentPlayerSymbol: string;
}

export interface IUser extends mongoose.Document {
username: string;
salt: string;
hashPass: string;
wins: number;
losses: number;
games: IUserGame[];

authenticate(password: string, salt: string, hashPass: string): boolean;
}

export interface IUserModel extends mongoose.Model<IUser> {
findByUsername(username: string, callback?: (err: any, res: IUser) => void): mongoose.Query<IUser>;
}

export interface IUserGame {
gameId: string;
playerSymbol: string;
}

export interface ISmallBoard {
tiles: string[][];
gameResult: string;
}
}

//grunt-start
/// <reference path="app.ts" />
/// <reference path="constants.ts" />
/// <reference path="controllers/gamesController.ts" />
/// <reference path="controllers/usersController.ts" />
/// <reference path="errorHandlers/index.ts" />
/// <reference path="config/auth.ts" />
/// <reference path="config/config.ts" />
/// <reference path="config/express.ts" />
/// <reference path="config/mongoose.ts" />
/// <reference path="utilities/debugging.ts" />
/// <reference path="utilities/encryption.ts" />
/// <reference path="utilities/errors.ts" />
/// <reference path="utilities/validation.ts" />
/// <reference path="routes/index.ts" />
/// <reference path="routes/socket.ts" />
/// <reference path="data/models/Games.ts" />
/// <reference path="data/models/ModelEnumerationOperations.ts" />
/// <reference path="data/models/ModelEnumerations.ts" />
/// <reference path="data/models/Users.ts" />
//grunt-end
