const init = (roomservice) => {
    const express = require('express');
    let router = express.Router();
    const riddler = require('../services/riddlerservice');
    const Userservice = require('../services/Userservice');
    const auth = require('../services/middleware/AuthMiddleware');

    router.get('/', (req, res) => {

        riddler.getqSets().then((qsets) => {
            if (req.session && req.session.userId) {
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
        if (qsets) {
            let sets = [];
            if (qsets instanceof Array) {
                qsets.forEach((set) => {
                    sets.push(JSON.parse(set));
                });
            } else {
                sets.push(JSON.parse(qsets));
            }
            roomservice.newRoom(sets).then((roomcode) => {
                res.render('gameMaster', { roomcode: roomcode });
            }, (err) => {
                res.redirect('/?err=' + err.toString('base64'));
            });
        } else {
            res.redirect('/?err=' + 'no qsets'.toString('base64'));
        }
    });

    router.post('/join', (req, res) => {
        let name = req.body.username;
        let rcode = req.body.roomcode;
        if (name) {
            name = name.toUpperCase();
        }
        if (rcode) {
            rcode = rcode.toLowerCase();
        }
        roomservice.findRoom(rcode).then((ind) => {
            if (ind === -1) {
                res.redirect('/?err=' + 'room not found'.toString('base64'));
            } else if (name === '' || !name || name === 'MASTER') {
                res.render('gameMaster', {
                    roomcode: rcode
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
        if (req.session.userId) {
            res.redirect('/');
        } else {
            res.render('login');
        }
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
            if (req.body.password === req.body.passwordConf) {
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
                res.render('register', { userData: userData, err: 'password and confirm password fields need to be the same' });
            }

        } else {
            res.render('register', { userData: userData, err: 'please fill in the complete form' });
        }
    });

    router.get('/profile', auth.requiresLogin, (req, res) => {
        Userservice.getUser(req.session.userId).then((user) => {
            riddler.getqSetsUser(user[0].username).then((sets) => {
                res.render('profile', { user: user[0], qsets: sets });
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

    router.post('/updateset', auth.requiresLogin, (req, res) => {
        let inp = req.body.final
        if (inp) {
            inp = JSON.parse(inp);
            Userservice.getUser(req.session.userId).then((user) => {
                let todel = { set: inp[0].set, user: user[0].username };
                riddler.delQset(todel).then((r) => {
                    let proms = [];
                    inp.forEach((q) => {
                        proms.push(riddler.addQuestion(q));
                    });
                    Promise.all(proms).then((rs) => {
                        res.redirect('/profile');
                    }, (err) => {
                        console.log(err);
                        res.redirect('/profile');
                    });
                }, (err) => {
                    console.log(err);
                    res.redirect('/profile');
                });
            }, (err) => {
                console.log(err);
                res.redirect('/');
            });
        } else {
            res.redirect('/profile');
        }
    });
    router.post('/delset', auth.requiresLogin, (req, res) => {
        let todel = req.body.todel;
        if (todel) {
            todel = JSON.parse(todel);
            Userservice.getUser(req.session.userId).then((user) => {
                console.log(todel);
                if (user[0].username === todel.user) {
                    riddler.delQset(todel).then((r) => {
                        res.redirect('/profile');
                    }, (err) => {
                        console.log(err);
                        res.redirect('/profile');
                    });
                } else {
                    res.redirect('/profile');
                }
            }, (err) => {
                console.log(err);
                res.redirect('/');
            })
        } else {
            res.redirect('/profile');
        }
    });
    return router;
};


module.exports = init;