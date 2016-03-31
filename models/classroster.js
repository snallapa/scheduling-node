var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClassRoster = new Schema({
    name: String,
    nameLower: {type: String, unique: true},
    description: String
});


module.exports = mongoose.model('ClassRoster', ClassRoster);