var master = {};


master.init = function() {

    master.roomcode = document.querySelector('#roomcode').innerHTML;
    master.window = document.querySelector('#Gamewindow');

    master.socket = io({
        query: {
            roomcode: master.roomcode
        }
    });

    master.updateScreen = function() {
        var window = '<div>';
        if (master.state.round === 0) {
            window += '<h2> Waiting to start ...</h2>';

        } else {
            //show question and anwser possibilities
        }
        window += '<ul class= "players">';
        if (master.state.players.length > 0) {
            master.state.players.forEach(player => {
                window += '<li>';
                window += player.name;
                if (player.ready) {
                    window += '<span class="readystate">  ready!</span>';
                }
                window += '</li>';
            });
        }
        window += '</ul>';
        window += '<p class="mastercount"> number of masters: ';
        window += master.state.masters;
        window += '</p>';

        window += '</div>';
        master.window.innerHTML = window;
    };
    master.socket.on('gameUpdate', function(state) {
        master.state = state;
        master.updateScreen();
    });
    master.socket.on('err', function(err) {
        if (err === 'room not found') {
            window.location.replace(window.location.hostname);
        }
    });
};

master.init();