class player {
    constructor(name, socket) {
        this.name = name;
        this.socket = socket;
        this.ready = false;
    }
}

module.exports = player;