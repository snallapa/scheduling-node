var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Participant = new Schema({
    name: String,
    nameLower: {type: String, unique:true}
});


module.exports = mongoose.model('Participant', Participant);