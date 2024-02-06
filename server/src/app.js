const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser')
const api = require("./routes/api");



const app = express();

// .use is middleware
app.use(cors({
    origin: 'http://localhost:3000',
}));

// we use morgan for logs
app.use(morgan('combined'));

// app.use(express.json); //NOT WORKING FOR ME, using below BODY PARSER Instead

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// static server static files, in our case react build folder
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/v1', api);

//below without * tells to take index.html by default oon / route, it is working for us without below middleware too
/*app.get('/', (req, res) => {
    res.send(path.join(__dirname, '..', 'public', 'index.html'));
});*/

// so below is used so that we can manage routes handled by React and refresh on any page which is not default page
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;