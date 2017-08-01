var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClassRoster = new Schema({
    name: String,
    nameLower: String,
    description: String,
    location: String,
    locationLower: String,
    maxNumber: Number,
    availabilities: Array
});

ClassRoster.index({nameLower: 1, locationLower:1, maxNumber:1}, {unique : true});
module.exports = mongoose.model('ClassRoster', ClassRoster);