const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const db = 'spaceman_game'
const mongoDBUrl = 'mongodb://localhost:27017/' + db;
mongoose.connect(mongoDBUrl);

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));

const SpacemanGame = require('./models/spaceman_game').SpacemanGame

// For reading application/json POSTs
app.use( bodyParser.json() )

// Enabling CORS (cross-origin scripting) for dev purposes
const cors = require( 'cors' )
app.use( cors() )

var gameRoutes = require('./routes/game')
app.use('/spaceman/api', gameRoutes)

app.listen(3000, () => console.log('Spaceman API listening on port 3000!'))