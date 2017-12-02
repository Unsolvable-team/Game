var client = {}

client.init = function() {
    client.roomcode = document.querySelector('#roomcode').innerHTML;
    client.name = document.querySelector('#name').innerHTML;

    client.socket = io({
        roomcode: client.roomcode,
        username: client.name
    })
};

client.init();