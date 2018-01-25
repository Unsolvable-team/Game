webpackJsonp([4],{

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var master = {};

master.init = function () {

    master.roomcode = document.querySelector('#roomcode').innerHTML;
    master.window = document.querySelector('#Gamewindow');
    master.timerwindow = document.querySelector('#Timerwindow');
    console.log(master.roomcode);

    master.socket = io({
        query: {
            roomcode: master.roomcode
        }
    });

    master.updateScreen = function () {
        var window = '<div>';
        if (master.state.round === 0) {
            window += '<h2><p> Waiting to start ...</p></h2>';
        } else {
            window += '<h2><p>' + master.state.question + '</p></h2>\n            <h3>Use your device to anwser</h3>';
        }
        window += '<ul class= "players">';
        if (master.state.players.length > 0) {
            master.state.players.forEach(function (player) {
                window += '<li>\n                    ' + player.name.toUpperCase();
                if (player.ready) {
                    window += '<span><i class="material-icons">check</i></span>';
                }
                if (!player.connected) {
                    window += '<span><i class="material-icons">error</i></span>';
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
    master.updateTimer = function () {
        master.counter++;
        if (master.counter < master.maxcounter) {
            master.timerwindow.innerHTML = '' + (master.maxcounter - master.counter);
        } else {
            master.timerwindow.innerHTML = '';
        }
    };

    master.socket.on('gameUpdate', function (state) {
        master.state = state;
        master.updateScreen();
    });
    master.socket.on('err', function (err) {
        if (err === 'room not found') {
            console.log(err);
        }
    });

    master.socket.on('timerUpdate', function (nr) {
        master.counter = 0;
        clearInterval(master.timer);
        master.timerwindow.innerHTML = '';
        if (nr.time && nr.time !== 0) {
            //start timer and update timerwindow
            master.maxcounter = nr.time;
            master.timer = setInterval(function () {
                master.updateTimer();
            }, 1000);
        }
    });

    master.socket.on('roundup', function (state) {
        var html = '<h2><p>' + state.q + '</p></h2>\n        <div class="correct"><p>The correct anwser was: ' + state.correct + '</p></div>\n        <ul class="players scorelist">';
        state.players.forEach(function (player) {
            html += '\n            <div>';
            if (player.anwser) {
                html += '<div class="anwser">anwsered: ' + player.anwser + '</div>';
            } else {
                html += '<div class="anwser">anwsered: nothing</div>';
            }

            html += '\n            <li>' + player.name.toUpperCase() + ' </li>\n            <div class="score">score: ' + player.score + '</div>\n            </div>';
        });

        master.window.innerHTML = html;
    });
    master.socket.on('disconnect', function () {
        master.timerwindow.parentNode.removeChild(master.timerwindow);
        var html = '<h2>Connection lost to the server, go back to homescreen?</h2>\n        <ul class="options">\n        <li>\n        <button id="back" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Back</button>\n        </li>\n        <li>\n        <form method="POST"  action="/join"  enctype="json">\n        <input type="hidden" name="roomcode" value="' + master.roomcode + '">\n        <input type="hidden" name="username" value="master">\n        <input type= "submit" id="retry" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" value= "Retry">\n        </form>\n        </li>\n        </ul>';

        master.window.innerHTML = html;
        var back = document.getElementById('back');
        var retry = document.getElementById('retry');

        back.addEventListener('click', function () {
            location.replace('/');
        });
    });
    master.socket.on('stop', function () {
        location.replace('/');
    });
    master.socket.on('winners', function (state) {
        master.timerwindow.parentNode.removeChild(master.timerwindow);
        var window = '\n        <h2><p>Scoreboard</p></h2>\n        <ul class="winners demo-list-icon mdl-list">';
        for (var i = 0; i < state.players.length; i++) {
            window += '<li class="mdl-list__item">\n                <span class="mdl-list__item-primary-content">\n                <span>' + (i + 1) + '</span>\n                ' + state.players[i].name.toUpperCase() + '\n                </span>\n                <span>score: ' + state.players[i].score + '</span>\n            </li>';
        }
        window += '</ul>';
        master.window.innerHTML = window;
    });
};

master.init();

/***/ })

},[5]);