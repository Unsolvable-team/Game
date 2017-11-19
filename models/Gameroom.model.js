"use strict";
const crypto = require("crypto");
export default class Gameroom {
    constructor() {
        this.roomcode = crypto.randomBytes(3).toString('hex');
        this.players = [];
        this.masters = [];
    }
}