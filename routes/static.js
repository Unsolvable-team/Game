const init = (roomservice) => {
    const express = require('express');
    let router = express.Router();
    const riddler = require('../services/riddlerservice');
    const Userservice = require('../services/Userservice');
    const auth = require('../services/middleware/AuthMiddleware');

    router.get('/', (req, res) => {

        riddler.getqSets().then((qsets) => {
            if (req.session && req.session.userId) {
                console.log(req.session.userId);
                Userservice.getUser(req.session.userId).then((user) => {
                    res.render('index', { title: 'Unsolvable', qsets: qsets, username: user[0].username });
                }, (err) => {
                    console.log(err);
                    res.render('index', { title: 'Unsolvable', qsets: qsets });
                });

            } else {
                res.render('index', { title: 'Unsolvable', qsets: qsets });
            }

        });
    });

    router.post('/new', (req, res) => {
        let qsets = req.body.qsets;
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

    router.get('/login', (req, res) => {
        res.render('login');
    });

    router.post('/login', (req, res) => {
        var userData = {
            email: req.body.email,
            password: req.body.password
        };
        if (req.body.email && req.body.password) {
            Userservice.login(userData).then((user) => {
                req.session.userId = user._id;
                res.redirect('/profile');
            }, (err) => {
                res.render('login', { userData: userData, err: err });
            });
        } else {
            res.render('login', { userData: userData, err: 'all fields required' });
        }
    });

    router.get('/register', (req, res) => {
        res.render('register');
    });

    router.post('/register', (req, res) => {
        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            passwordConf: req.body.passwordConf
        };
        if (req.body.email &&
            req.body.username &&
            req.body.password &&
            req.body.passwordConf) {

            Userservice.register(userData).then((result) => {
                Userservice.login(userData).then((user) => {
                    req.session.userId = user._id;
                    res.redirect('/profile');
                }, (err) => {
                    console.log(err);
                    res.redirect('/');
                });
            }, (err) => {
                res.render('register', { userData: userData, err: err });
            });
        } else {
            res.render('register', { userData: userData, err: 'please fill in the complete form' });
        }
    });

    router.get('/profile', auth.requiresLogin, (req, res) => {
        Userservice.getUser(req.session.userId).then((user) => {
            riddler.getqSetsUser(user.username).then((sets) => {
                console.log(user);
                res.render('profile', { user: user[0], sets: sets });
            }, (err) => {
                console.log(err);
                res.redirect('/');
            });

        }, (err) => {
            console.log(err);
            res.redirect('/');
        });

    });

    router.get('/logout', (req, res, next) => {
        if (req.session) {
            req.session.destroy((err) => {
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }

    });

    return router;
};


module.exports = init;