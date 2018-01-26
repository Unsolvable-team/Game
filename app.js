const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require("./config");

let gameservice = require('./services/gameservice');
const router = require('./routes/static.js')(gameservice);
const session = require('express-session');

//connect to db
mongoose.connect(config.DB, {
    useMongoClient: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connected to db');
});

//start http server
app.use(express.static('client/public'));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.use(session({
    secret: 'this is unsolvable',
    resave: true,
    saveUninitialized: false
}));
app.use('/', router);
app.set('views', path.join(__dirname, 'client/src/views'));
app.set('view engine', 'pug');

//setup socket server
require('./routes/socket.js')(io, gameservice);

http.listen(config.port, config.host, () => {
    console.log(` http://${config.host}:${config.port}/`);
});