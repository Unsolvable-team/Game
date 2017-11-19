var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    //TODO: print the number of rooms active
    res.render('index', { title: 'Unsolvable', roomcount: 0 });
});

module.exports = router;