let Userservice = {};
const User = require('../models/User.model');
const bcrypt = require('bcrypt');

Userservice.register = (userData) => {
    const p = new Promise((res, rej) => {
        let user = new User(userData);
        user.save(user, (err) => {
            if (err) {
                if (err.indexOf('email_1 dup key') !== -1) {
                    err = 'email already registered';
                }
                rej(err);
                return;
            } else {
                res(user);
                return;
            }
        });

    });
    return p;
};
//authenticate input against database
Userservice.login = (userData) => {
    const p = new Promise((res, rej) => {
        if (userData.password && userData.email) {
            User.findOne({ email: userData.email }).exec((err, user) => {
                if (err) {
                    console.log(err);
                    rej(err);
                    return;
                } else if (!user) {
                    rej('user not found');
                    return;
                } else {
                    bcrypt.compare(userData.password, user.password, (err, result) => {
                        if (result === true) {
                            res(user);
                            return;
                        } else {
                            rej('email or password was incorrect');
                            return;
                        }
                    });
                }
            });
        } else {
            rej('password and email required for login attempt');
            return;
        }
    });
    return p;
};

Userservice.getUser = (id) => {
    const p = new Promise((res, rej) => {
        User.find({ _id: id }, 'username email').exec((err, user) => {
            if (err) {
                rej(err);
                return;
            } else if (!user) {
                rej('User not found');
                return;
            } else {
                res(user);
            }
        });
    });
    return p;
};

module.exports = Userservice;