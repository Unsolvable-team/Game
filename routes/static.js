const init = (roomservice) => {
    const express = require('express');
    let router = express.Router();
    const riddler = require('../services/riddlerservice');

    router.get('/', (req, res) => {
        riddler.getqSets().then((qsets) => {
            res.render('index', { title: 'Unsolvable', qsets: qsets });
        });
    });

    router.post('/new', (req, res) => {
        let qsets = req.body.qsets;
        console.log(qsets);
        roomservice.newRoom(qsets).then((roomcode) => {
            res.render('gameMaster', { roomcode: roomcode });
        }, (err) => {
            res.render('index', { title: 'Unsolvable', err: err });
        });

    });

    router.post('/join', (req, res) => {
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