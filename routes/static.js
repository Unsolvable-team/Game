const init = (roomservice) => {
    const express = require('express');
    let router = express.Router();

    router.get('/', (req, res, next) => {
        res.render('index', { title: 'Unsolvable' });
    });

    router.post('/new', (req, res, next) => {
        roomservice.newRoom().then((roomcode) => {
            res.render('gameMaster', { roomcode: roomcode });
        }, (err) => {
            res.render('index', { title: 'Unsolvable', err: err });
        });

    });

    router.post('/join', (req, res, next) => {
        let name = req.body.username;
        let rcode = req.body.roomcode;

        roomservice.findRoom(rcode).then((ind) => {
            if (ind === -1) {
                res.render('index', {
                    title: 'Unsolvable',
                    err: 'room not found'
                });
            } else {
                res.render('player', {
                    roomcode: rcode,
                    name: name
                });
            }
        });


    });
    return router;
};


module.exports = init;