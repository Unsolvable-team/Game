const player = require('./player.model');

const crypto = require("crypto");

class gameroom {
    constructor() {
        this.roomcode = crypto.randomBytes(3).toString('hex');
        this.players = [];
        this.masters = [];
        this.round = 0;
    }

    addMaster(socket) {
        //add event managers
        this.masters.push(socket);
        this.masterUpdate();
    }
    addPlayer(name, socket) {
        let plyr = new player(name, socket);

        //add event managers
        this.players.push(plyr);
        this.masterUpdate();
    }
    masterUpdate() {
        this.generateGamestate().then((state) => {
            this.masters.forEach(socket => {
                socket.emit('gameUpdate', state);
            });
        });

    }
    generateGamestate() {
        const p = new Promise((res, rej) => {
            let plyrs = [];
            this.players.forEach((player) => {
                plyrs.push(player.name);
            });
            let gamestate = {
                masters: this.masters.length,
                players: plyrs,
                round: this.round
            };
            res(gamestate);
        });
        return p;
    }
}

module.exports = gameroom;