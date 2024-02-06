const mongoose = require('mongoose');

require('dotenv').config(); // mostly for test case this one


const MONGO_URL = process.env["MONGO_URL"];


mongoose.connection.once('open', () => {
    console.log('MongoDb connection ready');
});

mongoose.connection.on('error', (err) => {
    console.log('error', err);
});

async function connectMongoose() {
    await mongoose.connect(MONGO_URL);
}

async function disconnectMongoose() {
    await mongoose.disconnect();
}

module.exports = {
    connectMongoose,
    disconnectMongoose
}