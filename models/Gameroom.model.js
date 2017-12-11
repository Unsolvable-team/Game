const player = require('./player.model');

const crypto = require("crypto");

class gameroom {
    constructor(riddler) {
        this.roomcode = crypto.randomBytes(3).toString('hex');
        this.players = [];
        this.masters = [];
        this.round = 0;
        this.currentquestion = null;
        this.riddler = riddler;
    }

    addMaster(socket) {
        //add event managers
        this.masters.push(socket);
        this.masterUpdate();
    }

    checkNextQuestion() {
        const p = new Promise((res, rej) => {
            if (this.players.length === 0) {
                rej('No players');
            }
            this.players.forEach((player) => {
                if (!player.ready) {
                    rej('player not ready');
                }
            });
            res();
        });
        return p;
    }

    nextQuestion() {
        this.round++;
        this.resetReadystate();
        if (this.round > 0) {
            this.riddler.getQuestion().then((q) => {
                this.currentquestion = q;
                this.masterUpdate();
                this.playerUpdate();
            }, (err) => {

            });
        }
    }

    addPlayer(name, socket) {
        let plyr = new player(name, socket);
        this.players.push(plyr);

        //add event managers
        socket.on('anwser', (data) => {
            plyr.ready = true;
            this.masterUpdate();
            this.checkNextQuestion().then((res) => {
                this.nextQuestion();
            }, (rej) => {

            });
        });
        if (this.round === 0) {
            socket.emit('question', {
                q: 'ready to start?',
                a: ['ready']
            });
        }

        this.masterUpdate();
    }
    resetReadystate() {
        this.players.forEach((player) => {
            player.ready = false;
        });
    }
    masterUpdate() {
        this.generateGamestate().then((state) => {
            this.masters.forEach(socket => {
                socket.emit('gameUpdate', state);
            });
        });

    }
    playerUpdate() {
        this.players.forEach((player) => {
            player.socket.emit('question', {
                q: this.currentquestion.q,
                a: this.currentquestion.a
            });
        });
    }
    generateGamestate() {
        const p = new Promise((res, rej) => {
            let plyrs = [];
            this.players.forEach((player) => {
                plyrs.push({
                    name: player.name,
                    ready: player.ready
                });
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