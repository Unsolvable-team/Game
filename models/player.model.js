class player {
    constructor(name, socket) {
        this.name = name;
        this.socket = socket;
        this.ready = false;
        this.score = 0;
        this.lastanwser = null;
        this.connected = true;
    }
}

module.exports = player;