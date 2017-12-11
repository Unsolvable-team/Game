var player = {};


player.init = function() {

    player.roomcode = document.querySelector('#roomcode').innerHTML;
    player.name = document.querySelector('#name').innerHTML;
    player.window = document.querySelector('#window');

    player.socket = io({
        query: {
            roomcode: player.roomcode,
            username: player.name
        }
    });

    player.reset = function() {
        player.window.innerHTML = '<h2>waiting...</h2>';
    };

    player.update = function() {
        let q = '<div>';
        if (player.question.q) {
            q += '<h2>';
            q += player.question.q;
            q += '</h2>';
        }
        if (player.question.a) {
            q += '<div>';
            if (player.question.a.length > 0) {
                player.question.a.forEach(anwser => {
                    q += '<button class="anwser">';
                    q += anwser;
                    q += '</button>';
                });
            }
            q += '</div>';
        }

        q += '</div>';

        player.window.innerHTML = q;
        console.log(document.querySelectorAll('.anwser'));
        document.querySelectorAll('.anwser').forEach(function(element) {
            element.addEventListener('click', function() {
                player.socket.emit('anwser', element.innerHTML);
                player.reset();
            });
        });
    };
    player.socket.on('err', function(err) {
        if (err === 'room not found') {
            window.location.replace(window.location.hostname);
        } else if (err === 'player name already exists') {
            // ask for new name
        }
    });
    player.socket.on('question', function(question) {
        console.log(question);
        player.question = question;
        player.update();
    });
};

player.init();