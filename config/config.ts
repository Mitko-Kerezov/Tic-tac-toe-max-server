/// <reference path='../.d.ts' />

module.exports = {
    development: {
        db: 'mongodb://localhost:27017/tictactoemax',
        port: process.env.PORT || 1234
    }
};
