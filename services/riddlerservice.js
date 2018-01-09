const Question = require('../models/Question.model');

let Riddler = {};

Riddler.getQuestion = () => {
    //TODO/ edit this to use db
    const p = new Promise((res, rej) => {
        res({
            q: 'this is a question',
            a: ['this is an anwser', 'This, also, is an anwser', 'This is the last anwser']
        });
    });
    return p;
};

Riddler.getqSets = () => {
    const p = new Promise((res, rej) => {
        Question.aggregate([{
            // $project: {
            //     set_id: { $concat: ["$set", "$user"] },
            //     set: { $concat: ['$set'] },
            //     user: { $concat: ['$user'] }
            // },
            $group: {
                _id: { set: "$set", user: '$user' },
                count: { $sum: 1 }
            }
        }]).exec((err, set) => {
            if (err) {
                rej(err);
            } else {
                res(set);
            }
        });
    });
    return p;
};

module.exports = Riddler;