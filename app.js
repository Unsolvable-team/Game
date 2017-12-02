const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const bodyParser = require('body-parser');

const port = 3000;
const hostname = 'localhost';
let gameservice = require('./services/gameservice');
const router = require('./routes/static.js')(gameservice);




app.use(express.static('client/public'));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));


app.use('/', router);
app.set('views', path.join(__dirname, 'client/src/views'));
app.set('view engine', 'pug');

require('./routes/socket.js')(io, gameservice);

http.listen(port, hostname, () => {
    console.log(` http://${hostname}:${port}/`);
});