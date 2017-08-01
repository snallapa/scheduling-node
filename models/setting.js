var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Setting = new Schema({
    days: Array,
    startTime: Array,
    endTime: Array
});


module.exports = mongoose.model('Setting', Setting);