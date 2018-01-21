const Question = require('../models/Question.model');

let Riddler = {};

Riddler.getQuestion = () => {
    const p = new Promise((res, rej) => {
        res({
            q: 'this is a question',
            a: ['this is an anwser', 'This, also, is an anwser', 'This is the last anwser'],
            correct: 'this is the correct anwser'
        });
    });
    return p;
};

Riddler.getQuestions = (sets) => {

    const p = new Promise((res, rej) => {

        Question.find({ $or: sets }).exec((err, questions) => {
            if (err) {
                rej(err);
                return;
            }
            res(questions);
            return;
        });
    });
    return p;
}

Riddler.getqSets = () => {
    const p = new Promise((res, rej) => {
        Question.aggregate([{
            $group: {
                _id: { set: "$set", user: '$user' },
                count: { $sum: 1 }
            }
        }]).exec((err, set) => {
            if (err) {
                rej(err);
                return;
            } else {
                res(set);
                return;
            }
        });
    });
    return p;
};

Riddler.getqSetsUser = (username) => {
    const p = new Promise((res, rej) => {
        Question.aggregate([{
                $match: { 'user': username }
            },
            {
                $group: {
                    _id: { set: '$set', user: '$user' },
                    count: { $sum: 1 }
                }
            }
        ]).exec((err, sets) => {
            if (err) {
                rej(err);
                return;
            } else {
                res(sets);
            }
        });
    });
    return p;
};

module.exports = Riddler;