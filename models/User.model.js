const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


let userschema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});
//validate email
userschema.path('email').validate((email) => {
    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(email); // Assuming email has a text attribute
}, 'email address is invalid');

//hash password
userschema.pre('save', (next, user) => {
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
            next(err);
            return;
        }
        user.password = hash;
        next();
        return;
    });
});

let User = mongoose.model('User', userschema);
module.exports = User;