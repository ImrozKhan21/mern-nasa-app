const mongoose = require('mongoose');


// each type can be like with more options flightNumber: {type: Number, required: true, default: 100, min: 100, max: 999},

//     target: {ref: 'Planet', type: mongoose.ObjectId}, if we want to reference to another document, but since we can't use join
// in this project it is not of much use as all the functionality we anyway have to build

const launchesSchema = new mongoose.Schema({
    flightNumber: {type: Number, required: true},
    mission: {type: String, required: true},
    rocket: {type: String, required: true},
    launchDate: {type: Date, required: true},
    target: {type: String, required: false}, // can also be like {ref: 'Planet', type: mongoose.ObjectId},
    customers: [String],
    upcoming: {type: Boolean, required: true},
    success: {type: Boolean, required: true, default: true},
});

// mongoose will automatically make name 'Launch' plural
module.exports = mongoose.model('Launch', launchesSchema);
