const player = require('./player.model');
const EventEmitter = require("events").EventEmitter;
const crypto = require("crypto");

const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

class gameroom {
    constructor(riddler, sets) {
        this.roomcode = crypto.randomBytes(3).toString('hex');
        this.players = [];
        this.masters = [];
        this.round = 0;
        this.currentquestion = { q: 'waiting for players' };
        this.timer = null;
        this.allowAnwsers = true;
        this.maxrounds = 15;
        this.canConnect = true;
        this.events = new EventEmitter();
        riddler.getQuestions(sets).then((questions) => {
            this.questions = questions;
        });
    }

    /**
     * adds master to this room
     * @param {Socket} socket  the socket the master is connected on
     */
    addMaster(socket) {
        //add event managers
        this.masters.push(socket);
        socket.on('disconnect', (reason) => {
            this.masters.splice(this.masters.indexOf(socket), 1);
            this.masterUpdate();
            this.checkStop();
        });
        this.masterUpdate();
    }

    /**
     * checks wether or not the game is ready to start and starts appropriate timers when neccesary
     * @returns {Promise} promise
     */
    checkStart() {
        const p = new Promise((res, rej) => {
            let ok = false;
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
                    if (this.timer === null) {
                        ok = true;
                        this.timer = setTimeout(() => {
                            res(true);
                            this.stoptimer();
                            return;
                        }, 60 * 1000); //time to get ready
                        this.timerUpdate(60);
                    }
                    //if everyone is ready
                } else if (readycount === this.players.length) {
                    //clear timer
                    this.stoptimer();
                    //start game
                    res(true);
                    return;
                    // if noone is ready
                } else if (readycount === 0) {
                    //don't start game
                    rej('Nobody is ready');
                    return;
                }
            }
            if (!ok) {
                rej();
            }
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

    scorePlayers() {
        this.players.forEach((player) => {
            if (player.lastanwser && player.lastanwser === this.currentquestion.correct) {
                player.score += 1;
            }
        })
    }

    /**
     * gets the next question from riddler. 
     * updates players and masters. 
     * Starts timer to stop taking anwsers from players
     */
    nextQuestion() {
        this.stoptimer();
        this.round++;
        if (this.round > 0) {
            this.canConnect = false;
        }
        this.resetReadystate();
        if ((this.round > 0 && this.round <= this.maxrounds) && this.round <= this.questions.length) {
            this.getQuestion().then((q) => {
                this.currentquestion = q;
                if (this.timer === null) {
                    this.timer = setTimeout(() => {
                        this.finishQuestion();
                    }, 30 * 1000); // after 30s
                }
                this.timerUpdate(30);
                this.masterUpdate();
                this.playerUpdate();
                this.allowAnwsers = true;
            }, (err) => {
                console.log(err);
            });
        } else if (this.round > this.maxrounds || this.round > this.questions.length) {
            this.showWinners();
        }
    }
    getQuestion() {
        const p = new Promise((res, rej) => {
            let i = Math.floor(Math.random() * this.questions.length);
            let q = this.questions[i];
            this.questions.splice(i, 1);
            res(q);
            return;
        });
        return p;
    }


    /**
     * Stops the current timer if one is running and sets the value to null
     */
    stoptimer() {
        if (this.timer !== null) {
            clearTimeout(this.timer);
        }
        // this.resetReadystate();
        this.timer = null;
        this.timerUpdate(0);
    }

    /**
     * sends questionresults to master, starts next question after a time
     */
    finishQuestion() {
        this.stoptimer();
        this.allowAnwsers = false;
        this.scorePlayers();
        //show results
        this.generateRoundup().then((state) => {
            this.masters.forEach((socket) => {
                socket.emit('roundup', state);
            });
        });

        //nextquestion
        if (this.timer === null) {
            this.timer = setTimeout(() => {
                this.nextQuestion();
            }, 10 * 1000); //after 10s
        }
    }

    generateRoundup() {
        const p = new Promise((res, rej) => {
            let players = [];
            this.players.forEach((player) => {
                players.push({
                    name: player.name,
                    score: player.score,
                    anwser: player.lastanwser
                })
            });

            res({
                players: players,
                q: this.currentquestion.q,
                correct: this.currentquestion.correct
            });
        });
        return p;
    }

    reconnectPlayer(name, socket) {
        let plyr = null;
        this.players.forEach(player => {
            if (player.name === name) {
                plyr = player;
            }
        });

        if (plyr !== null) {
            plyr.socket = socket;
            plyr.connected = true;
            this.masterUpdate();
            plyr.socket.emit('reconnected');
            this.addEvents(plyr);
        }
    }

    checkStop() {
        let con = this.masters.length !== 0;
        if (this.players.length > 0) {
            this.players.forEach(player => {
                con = player.connected | con;
            });
        }
        if (!con) {
            this.stopGame();
        }
    }

    addEvents(plyr) {
        plyr.socket.on('anwser', (data) => {
            if (this.allowAnwsers) {
                plyr.ready = true;
                plyr.lastanwser = data;
                this.masterUpdate();

                if (this.round === 0) {
                    this.checkStart().then((res) => {
                        this.nextQuestion();
                    }, (rej) => {});
                } else if (this.round > 0) {
                    this.checkFinishQuestion().then((res) => {
                        this.finishQuestion();
                    }, (rej) => {

                    });
                }
            }
        });

        plyr.socket.on("disconnect", (reason) => {
            plyr.connected = false;
            this.checkStop();
            this.masterUpdate();
        });

        //if game has not started
        if (this.round === 0) {
            this.allowAnwsers = true;
            //ask if player is ready
            plyr.socket.emit('question', {
                q: 'ready to start?',
                a: ['ready']
            });
        }
    }

    /**
     * Creates a new player object and adds it to the room.
     * Also adds all eventslisteners for the player.
     * @param {string} name the name of the player
     * @param {Socket} socket the socket the player is connected on
     */
    addPlayer(name, socket) {
            if (this.canConnect) {
                let plyr = new player(name, socket);
                this.players.push(plyr);
                //add event managers
                this.addEvents(plyr);
                this.masterUpdate();
            } else {
                socket.emit('err', 'game already in play');
            }
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
         * @param {number} time time (in milliseconds) to send to masters 
         */
    timerUpdate(time) {
            this.masters.forEach((socket) => {
                socket.emit('timerUpdate', { time: time });
            });
        }
        /**
         * sends the current question to all players
         */
    playerUpdate() {
            this.players.forEach((player) => {
                let a = [];
                a = a.concat(this.currentquestion.a);
                a.push(this.currentquestion.correct);
                //TODO: shuffle a
                player.socket.emit('question', {
                    q: this.currentquestion.q,
                    a: shuffle(a)
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
                    connected: player.connected
                });
            });
            let gamestate = {
                masters: this.masters.length,
                players: plyrs,
                round: this.round,
                question: this.currentquestion.q
            };
            res(gamestate);
        });
        return p;
    }
    stopGame() {
        setTimeout(() => {
            this.masters.forEach(socket => {
                socket.emit('stop');
            });
            this.players.forEach(player => {
                player.socket.emit('stop');
            });
            this.events.emit('stop');
        }, 10 * 1000);

    }
    showWinners() {
        this.players.sort((a, b) => {
            return a.score < b.score;
        })
        this.generateGamestate().then((state) => {
            this.masters.forEach(socket => {
                socket.emit('winners', state)
            });
            for (let i = 0; i < this.players.length; i++) {
                this.players[i].socket.emit('place', i + 1);
            }
            this.stopGame();
        })

    }
}

module.exports = gameroom;