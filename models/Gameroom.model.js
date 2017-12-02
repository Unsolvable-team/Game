const player = require('./player.model');

const crypto = require("crypto");

class gameroom {
    constructor() {
        this.roomcode = crypto.randomBytes(3).toString('hex');
        this.players = [];
        this.masters = [];
    }

    addMaster(socket) {
        //add event managers
        this.masters.push(socket);
    }
    addPlayer(name, socket) {
        let plyr = new player(name, socket);

        //add event managers
        this.players.push(plyr);
    }
}

module.exports = gameroom;