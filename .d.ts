interface IUserRequestData {
username: string;
password: string;
confirmPassword?: string;
}

//grunt-start
/// <reference path="app.ts" />
/// <reference path="controllers/gamesController.ts" />
/// <reference path="controllers/usersController.ts" />
/// <reference path="errorHandlers/index.ts" />
/// <reference path="config/config.ts" />
/// <reference path="config/mongoose.ts" />
/// <reference path="utilities/encryption.ts" />
/// <reference path="utilities/errors.ts" />
/// <reference path="utilities/validation.ts" />
/// <reference path="routes/index.ts" />
/// <reference path="data/models/Games.ts" />
/// <reference path="data/models/Users.ts" />
//grunt-end
