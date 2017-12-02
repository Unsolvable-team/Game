module.exports = (io) => {

    io.on('connection', (socket) => {
        let roomcode = socket.handshake.query.roomcode;
        let username = socket.handshake.query.username;
        if (username === undefined) {
            //join as master
        } else {
            //join as player
        }
    });
};