import { setTimeout, clearTimeout } from 'timers';

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
        this.timer = null;
    }

    addMaster(socket) {
        //add event managers
        this.masters.push(socket);
        this.masterUpdate();
    }

    checkStart() {
        const p = new Promise((res, rej) => {
            if (this.players.length === 0) {
                rej('No players');
                return;
            }
            //if game not started
            if (this.round === 0) {
                let readycount = 0;
                this.players.forEach((player) => {
                    if (player.ready) {
                        readycount++;
                    }
                });
                //if someone is ready, but no timer is running
                if (readycount > 0 && readycount < this.players.length && this.timer === null) {
                    //start game after 60 seconds
                    this.timer = setTimeout(() => {
                        res();
                        return;
                    }, 60 * 1000); //time to get ready

                    //if everyone is ready
                } else if (readycount === this.players.length) {
                    //clear timer
                    if (this.timer !== null) {
                        clearTimeout(this.timer);
                        this.timer = null;
                    }
                    //start game
                    res();
                    return;
                    // if noone is ready
                } else if (readycount === 0) {
                    //don't start game
                    rej('Nobody is ready');
                    return;
                }
            }
            rej();
        });
        return p;
    }

    checkFinishQuestion() {
        const p = new Promise((res, rej) => {
            //if game has started
            if (this.round > 0) {
                let readycount = 0;
                this.players.forEach((player) => {
                    if (player.ready) {
                        readycount++;
                    }
                });
                //if everyone has anwsered
                if (readycount === this.players.length) {
                    //stop timer
                    this.stoptimer();
                    //finish question
                    res();
                    return;
                }
            }
            //question not ready to finish
            rej();
        });
        return p;
    }

    nextQuestion() {
        this.stoptimer();
        this.round++;
        this.resetReadystate();
        if (this.round > 0) {
            this.riddler.getQuestion().then((q) => {
                this.currentquestion = q;
                this.timer = setTimeout(() => {
                    this.finishQuestion();
                }, 30 * 1000); // after 30s

                this.masterUpdate();
                this.playerUpdate();
            }, (err) => {

            });
        }
    }

    stoptimer() {
        if (this.timer !== null && this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    finishQuestion() {
        this.stoptimer();
        //show results

        //nextquestion
        this.timer = setTimeout(() => {
            this.nextQuestion();
        }, 10 * 1000); //after 10s
    }

    addPlayer(name, socket) {
        let plyr = new player(name, socket);
        this.players.push(plyr);
        //add event managers

        socket.on('anwser', (data) => {
            plyr.ready = true;
            this.masterUpdate();

            if (this.round === 0) {
                this.checkStart().then((res) => {
                    this.nextQuestion();
                }, (rej) => {

                });
            } else if (this.round > 0) {
                this.checkFinishQuestion().then((res) => {
                    this.finishQuestion();
                }, (rej) => {

                });
            }
        });

        //if game has not started
        if (this.round === 0) {
            //ask if player is ready
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