const gameroom = require('../models/gameroom.model');

let rooms = [];
//creates a new room with unique code and returns that code
let newRoom = () => {
    const p = new Promise((res, rej) => {
        let room = new gameroom();

        while (findRoomSync(room.roomcode) !== -1) {
            room = new gameroom();
        }
        rooms.push(room);
        res(room.roomcode);
    });
    return p;
};
//creates a new player and adds it to the room, validation occurs
let newPlayer = (roomcode, name, socket) => {
    const p = new Promise((res, rej) => {
        findRoom(roomcode).then((ind) => {
            if (ind === -1) {
                rej('room not found');
            } else {
                let room = rooms[ind];
                if (room.players.length > 0) {
                    room.players.forEach((player) => {
                        if (player.name === name) {
                            rej('player name already exists');
                        }
                    });
                }
                res(room.addPlayer(name, socket));
            }
        });
    });
    return p;
};

let findRoomSync = (roomcode) => {
    let p = -1;

    rooms.forEach((room, index) => {
        if (room.roomcode === roomcode) {
            p = index;
            return p;
        }
    });
    return p;
};

//returns the idex of the room with the given roomcode, -1 if not exists
let findRoom = (roomcode) => {
    const p = new Promise((res, rej) => {
        let ind = -1;
        rooms.forEach((room, index) => {
            if (room.roomcode === roomcode) {
                ind = index;
                res(ind);
            }
        });
        res(ind);
    });

    return p;
};
//creates a new master and adds it to the room, validation occurs
let newMaster = (roomcode, socket) => {
    const p = new Promise((res, rej) => {
        findRoom(roomcode).then((ind) => {
            if (ind === -1) {
                rej('room not found');
            } else {
                rooms[ind].addMaster(socket);
                res('master added');
            }
        });
    });
    return p;
};

module.exports = { newRoom, newPlayer, newMaster, findRoom };