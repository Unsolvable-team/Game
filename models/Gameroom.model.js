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
        this.allowAnwsers = true;
    }

    /**
     * adds master to this room
     * @param {Socket} socket  the socket the master is connected on
     */
    addMaster(socket) {
        //add event managers
        this.masters.push(socket);
        this.masterUpdate();
    }

    /**
     * checks wether or not the game is ready to start and starts appropriate timers when neccesary
     * @returns {Promise} promise
     */
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

    /**
     * checks wether or not to stop taking anwsers from players
     * @returns {Promise} promise
     */
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

    /**
     * gets the next question from riddler. 
     * updates players and masters. 
     * Starts timer to stop taking anwsers from players
     */
    nextQuestion() {
        new Promise((res, rej) => {
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
                    this.allowAnwsers = true;
                }, (err) => {

                });
            }
        }).then();

    }

    /**
     * Stops the current timer if one is running and sets the value to null
     */
    stoptimer() {
        if (this.timer !== null) {
            clearInterval(this.timer);
        }
        this.timer = null;
    }

    /**
     * sends questionresults to master, starts next question after a time
     */
    finishQuestion() {
        this.stoptimer();
        this.allowAnwsers = false;
        //show results
        this.generateGamestate().then((state) => {
            state.roundup = true;
            this.masters.forEach((socket) => {
                socket.emit('gameUpdate', state);
            });
        });

        //nextquestion
        this.timer = setTimeout(() => {
            this.nextQuestion();
        }, 10 * 1000); //after 10s
    }

    /**
     * Creates a new player object and adds it to the room.
     * Also adds all eventslisteners for the player.
     * @param {string} name the name of the player
     * @param {Socket} socket the socket the player is connected on
     */
    addPlayer(name, socket) {
            let plyr = new player(name, socket);
            this.players.push(plyr);
            //add event managers

            socket.on('anwser', (data) => {
                if (this.allowAnwsers) {
                    plyr.ready = true;
                    plyr.lastanwser = data;
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
                }
            });

            //if game has not started
            if (this.round === 0) {
                this.allowAnwsers = true;
                //ask if player is ready
                socket.emit('question', {
                    q: 'ready to start?',
                    a: ['ready']
                });
            }
            this.masterUpdate();
        }
        /**
         * sets readystate of all players to false
         */
    resetReadystate() {
            this.players.forEach((player) => {
                player.ready = false;
                player.lastanwser = null;
            });
        }
        /**
         * sends gamestate object to all masters
         */
    masterUpdate() {
            this.generateGamestate().then((state) => {
                this.masters.forEach(socket => {
                    socket.emit('gameUpdate', state);
                });
            });
        }
        /**
         *  sends the current timer state to masters
         * @param {integer} time time (in milliseconds) to send to masters 
         */
    timerUpdate(time) {
            new Promise((res, rej) => {
                this.masters.forEach((socket) => {
                    socket.emit('timerUpdate', { time: time });
                });
                res();
            }).then();

        }
        /**
         * sends the current question to all players
         */
    playerUpdate() {
            this.players.forEach((player) => {
                player.socket.emit('question', {
                    q: this.currentquestion.q,
                    a: this.currentquestion.a
                });
            });
        }
        /**
         * generates a gamestate object
         * @returns {Promise} promise object,  res is the gamestate object
         */
    generateGamestate() {
        const p = new Promise((res, rej) => {
            let plyrs = [];
            this.players.forEach((player) => {
                plyrs.push({
                    name: player.name,
                    ready: player.ready,
                    score: player.score,
                    lastanwser: player.lastanwser
                });
            });
            let gamestate = {
                masters: this.masters.length,
                players: plyrs,
                round: this.round,
                roundup: false
            };
            res(gamestate);
        });
        return p;
    }
}

module.exports = gameroom;