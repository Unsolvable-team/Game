const express = require('express');
const router = express.Router();
const multiparty = require('multiparty');
let form = new multiparty.Form();

router.post('/join', (req, res, next) => {
    const contenttype = req.headers['content-type'];
    if (contenttype.indexOf('multipart/form-data') === -1) {
        res.send('Conflict', 409);
    } else {
        form.parse(req, (error, fields, files) => {
            if (error) {
                res.sendStatus(400);
            } else {
                Object.keys(fields).forEach((value, index, array) => {
                    if (value === 'roomNumber') {
                        res.sendStatus(500);
                        //TODO: create new player/connection
                    }
                });
            }
        });
    }
});

module.exports = router;