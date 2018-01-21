const Question = require('../models/Question.model');

let Riddler = {};

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
Riddler.delQset = (set) => {
    const p = new Promise((res, rej) => {
        Question.remove(set).exec((err, rs) => {
            if (err) {
                rej(err);
                return;
            } else {
                res(rs);
            }
        });
    });
    return p;
}
Riddler.addQuestion = (qs) => {
    const p = new Promise((res, rej) => {
        let q = new Question(qs);
        q.save((err, q) => {
            if (err) {
                rej(err);
                return;
            } else {
                res(q);
                return;
            }
        });
    });
    return p;
};

module.exports = Riddler;