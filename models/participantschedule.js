var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ParticipantSchedule = new Schema({
	participantId: {type: Schema.Types.ObjectId, ref: 'Participant'},
	day: Number,
	startTime: String,
	endTime: String,
	classrosterId: {type:Schema.Types.ObjectId, ref:'ClassRoster'},
	location: String,
	max: Number
});


module.exports = mongoose.model('ParticipantSchedule', ParticipantSchedule);