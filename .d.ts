interface IUserRequestData {
username: string;

password: string;
confirmPassword: string;
}

declare module 'Models' {
import mongoose = require('mongoose');

export interface IGame extends mongoose.Document {
board: any[];
canJoin: boolean;
isOver: boolean;
gameResult: string;
currentPlayingBoard: number;
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
gameId: mongoose.Types.ObjectId;
playerSymbol: string;
}
}

//grunt-start
/// <reference path="app.ts" />
/// <reference path="controllers/gamesController.ts" />
/// <reference path="controllers/usersController.ts" />
/// <reference path="errorHandlers/index.ts" />
/// <reference path="config/auth.ts" />
/// <reference path="config/config.ts" />
/// <reference path="config/express.ts" />
/// <reference path="config/mongoose.ts" />
/// <reference path="config/passport.ts" />
/// <reference path="utilities/debugging.ts" />
/// <reference path="utilities/encryption.ts" />
/// <reference path="utilities/errors.ts" />
/// <reference path="utilities/validation.ts" />
/// <reference path="routes/index.ts" />
/// <reference path="data/models/Games.ts" />
/// <reference path="data/models/ModelEnumerationOperations.ts" />
/// <reference path="data/models/ModelEnumerations.ts" />
/// <reference path="data/models/Users.ts" />
//grunt-end
