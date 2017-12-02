var player = {};


player.init = function() {

    player.roomcode = document.querySelector('#roomcode').innerHTML;
    player.name = document.querySelector('#name').innerHTML;

    player.socket = io({
        query: {
            roomcode: player.roomcode,
            username: player.name
        }
    });
    player.socket.on('gameUpdate', function(state) {
        console.log(state);
    });
    player.socket.on('err', function(err) {
        if (err === 'room not found') {
            window.location.replace(window.location.hostname);
        } else if (err === 'player name already exists') {
            // ask for new name
        }
    });
};

player.init();