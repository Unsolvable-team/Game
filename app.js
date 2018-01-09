const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const port = 80;
const hostname = '0.0.0.0';
let gameservice = require('./services/gameservice');
const router = require('./routes/static.js')(gameservice);

//connect to db
mongoose.connect('mongodb://webserver:paswoord_voor_webserver20182018@localhost/unsolvable', {
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
app.use('/', router);
app.set('views', path.join(__dirname, 'client/src/views'));
app.set('view engine', 'pug');

//setup socket server
require('./routes/socket.js')(io, gameservice);

http.listen(port, hostname, () => {
    console.log(` http://${hostname}:${port}/`);
});