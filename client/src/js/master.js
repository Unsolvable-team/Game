var master = {};

master.init = function() {
    master.socket = io({
        query: {
            token: 'cde'
        }
    });
};

master.init();