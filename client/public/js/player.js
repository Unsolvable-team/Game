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
        player.window.innerHTML = '<div class="loader"></div>';
    };

    player.update = function() {
        let q = '<div>';
        if (player.question.a) {
            q += '<div class="options">';
            if (player.question.a.length > 0) {
                player.question.a.forEach(anwser => {
                    q += '<button class="anwserbtn mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">';
                    q += anwser;
                    q += '</button>';
                });
            }
            q += '</div>';
        }

        q += '</div>';

        player.window.innerHTML = q;
        document.querySelectorAll('.anwserbtn').forEach(function(element) {
            element.addEventListener('click', function() {
                player.socket.emit('anwser', element.innerHTML);
                player.reset();
            });
        });
    };
    player.socket.on('err', function(err) {
        console.log(err === 'player name already exists');
        if (err === 'room not found') {
            location.replace('/');
        } else if (err === 'player name already exists') {
            var html = `
            <h2>The name ${player.name} is already taken, please enter a different one</h2>
            <form method="POST"  action="/join"  enctype="json">
            <input type="hidden" name="roomcode" value="${player.roomcode}">
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input" type="text" id="username" name= "username" value="">
                    <label class="mdl-textfield__label" for="username">Username</label>
                </div>
                <div class="mdl-textfield mdl-js-textfield">
                <input id='join' type="submit" value="Join" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"  disabled/>
                </div>
            </form>`;

            player.window.innerHTML = html;
            componentHandler.upgradeDom();
            var join = document.getElementById('join');
            var user = document.getElementById('username');
            user.addEventListener('keyup', function(evt) {
                if (user.value && user.value !== "" && user.value.toUpperCase() !== player.name) {
                    join.disabled = false;
                } else {
                    join.disabled = true;
                }
            });
        }
    });
    player.socket.on('question', function(question) {
        player.question = question;
        player.update();
    });
    player.socket.on('stop', function() {
        location.replace('/');
    })

    player.socket.on('disconnect', function() {
        var html = `<h2>Connection lost to the server, go back to homescreen?</h2>
        <ul class="options">
        <li>
        <button id="back" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Back</button>
        </li>
        <li>
        <form method="POST"  action="/join"  enctype="json">
        <input type="hidden" name="roomcode" value="${player.roomcode}">
        <input type="hidden" name="username" value="${player.name}">
        <input type= "submit" id="retry" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" value= "Retry">
        </form>
        </li>
        </ul>`;

        player.window.innerHTML = html;
        var back = document.getElementById('back');
        var retry = document.getElementById('retry');

        back.addEventListener('click', function() {
            location.replace('/');
        });
    });
    player.socket.on('reconnected', function() {
        console.log('reconnected');
    });
    player.socket.on('place', function(place) {
        let html = `
        <h2>congrats, you placed as number 
            <div class="place">${place}</div>
        </h2>
        `;

        player.window.innerHTML = html;
    })
};

player.init();