var master = {};


master.init = function() {

    master.roomcode = document.querySelector('#roomcode').innerHTML;

    master.socket = io({
        query: {
            roomcode: master.roomcode
        }
    });
};

master.init();