const mongoose = require('mongoose');

let questionschema = mongoose.Schema({
    set: String,
    q: String,
    a: Array,
    correct: String,
    user: String
});

let Question = mongoose.model('question', questionschema);

//when database is empty, enter some questions
let seed = () => {
    Question.count({}, (err, count) => {
        if (count <= 0) {
            let vals = require('../seed.json');
            vals.forEach(val => {
                let q = new Question(val);
                q.save((err, q) => {
                    if (err) {
                        console.log('err');
                    }
                });
            });
        }
    });
};

seed();



module.exports = Question;