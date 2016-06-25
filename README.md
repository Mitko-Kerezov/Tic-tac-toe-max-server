# Tic-tac-toe-max-server
Server for the Tic Tac Toe Max game.

Realization was achieved using TypeScript as a programming language, developed under [Sublime Text](https://www.sublimetext.com) and [VS Code](https://code.visualstudio.com).

The actual playing (making a move) was realized using the [ws npm package](https://www.npmjs.com/package/ws) and authentication was realized with json web tokens.

The Mobile Client consuming the server can be found [here](https://github.com/Mitko-Kerezov/Tic-Tac-Toe-Max-MobileClient).

# Starting
After cloning run **$ npm install**, a **postinstall** script will execute, if it passes without error you only have to run **$ npm start**. If it doesn't pass you have to:
* install [grunt-cli](https://www.npmjs.com/package/grunt-cli) globally using **$ npm i -g grunt-cli**.
* run **$ ./node_modules/.bin/tsd reinstall -o** for downloading the definition files.

Lastly, run **$ npm start**

# Debug logs
If you'd like to view debug logs, the environment variable **Debug** must be set to **Tic-Tac-Toe-Max:server**.
This can be achieved using $ export Debug=Tic-Tac-Toe-Max:server
