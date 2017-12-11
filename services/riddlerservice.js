let Riddler = {}

Riddler.getQuestion = () => {
    const p = new Promise((res, rej) => {
        res({
            q: 'this is a question',
            a: ['this is an anwser', 'This, also, is an anwser', 'This is the last anwser']
        });
    });
    return p;
};

module.exports = Riddler;