module.exports = (io, gameservice) => {
    io.on('connection', (socket) => {
        let roomcode = socket.handshake.query.roomcode;
        let username = socket.handshake.query.username;
        if (username === undefined || username === '' || username === 'MASTER') {
            //join as master
            gameservice.newMaster(roomcode, socket).then((res) => {
                //do nothing
            }, (err) => {
                socket.emit('err', err);
            });
        } else {
            //join as player
            gameservice.newPlayer(roomcode, username, socket).then((res) => {
                //do nothing
            }, (err) => {
                socket.emit('err', err);
            });
        }
    });
};