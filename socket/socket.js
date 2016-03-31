var Participant = require('../models/participant');
var ParticipantSchedule = require('../models/participantschedule');
var ClassRoster = require('../models/classroster');
var ObjectId = require('mongoose').Types.ObjectId;
var io;
module.exports = function(server){
  io = require('socket.io')(server);

  // catch errors
  io.on('error', function(err){
    throw err;
  })


  io.on('connection', function (socket) {
    console.log("connection made");

    //send userlist when connection is made
    emitUpdatedUsers(socket);
    emitUpdatedRosters(socket);
    
    //add a new participant
    socket.on('new participant', function(participant) {
      var newParticipant = new Participant({name:participant.name, nameLower: participant.name.toLowerCase()});
      newParticipant.save(function (err) {
        if (err) {
          console.log(err);
          socket.emit("errorMessage", "Could not add Participant. Try Refreshing. Error Message: " + err.errmsg);
        }
        //update all users of userlist
        emitUpdatedUsersToAll();
      });
    });

    //save schedule
    socket.on('save schedule', function(participant) {
      var classEvent = participant.classEvent;
      ParticipantSchedule.findOneAndUpdate({participantId:new ObjectId(participant.participantid), day:getNumberFromDay(classEvent.day), startTime: classEvent.startTime, endTime: classEvent.endTime}, {classrosterId: new ObjectId(classEvent.classrosterid)}, {upsert:true}, function(err) {
        if (err) {
          socket.emit("errorMessage", "Could not save schedule. Try Refreshing Error Message: " + err.errmsg);
        }
        io.emit('schedule change', participant.participantid);
      });

    });

    //edit participant
    socket.on('edit participant', function(newValue){
      Participant.update({nameLower:newValue.name.toLowerCase()}, {name: newValue.newName, nameLower: newValue.newName.toLowerCase()}, function (err) {
        if (err) {
          socket.emit("errorMessage", "Could not edit Participant. Try Refreshing Error Message: " + err.errmsg);
        }
        emitUpdatedUsersToAll();
      });
    });

    //remove participant
    socket.on('remove participant', function(participant) {
      Participant.remove({ nameLower: participant.name.toLowerCase() }, function (err) {
        if (err) {
          socket.emit("errorMessage", "Could not remove Participant. Try Refreshing Error Message: " + err.errmsg);
        }
        emitUpdatedUsersToAll();
      });
      ParticipantSchedule.remove({participantId: new ObjectId(participant.id)}, function (err) {
        if (err) {
          socket.emit("errorMessage", "Could not remove Participant. Try Refreshing Error Message: " + err.errmsg);
        }
        emitUpdatedRostersToAll();
      });
    });

    socket.on('new class', function(event) {
      ClassRoster.create({ name: event.name,nameLower:event.name.toLowerCase()}, function (err) {
        if (err) {
          socket.emit("errorMessage", "Could not edit Participant. Try Refreshing Error Message: " + err.errmsg);
        }
        emitUpdatedRostersToAll();
      });
    });

    socket.on('getSchedule', function(participantId) {
      console.log(participantId);
      
      ParticipantSchedule.find({participantId:new ObjectId(participantId)}).populate('classrosterId').exec(function (err, schedule) {
        if (err) {
          socket.emit("errorMessage", "Could not get schedule for this participant. Try Refreshing Error Message: " + err.errmsg);
        }
        socket.emit('participant schedule', schedule);
      });
    });

    socket.on('remove class', function(eventClass){
      ClassRoster.remove({_id:new ObjectId(eventClass.id)}, function(err) {
        if (err) {
          socket.emit("errorMessage", "Could not remove class. Try Refreshing Error Message: " + err.errmsg);
        }
        emitUpdatedRostersToAll();
      })
      ParticipantSchedule.remove({classrosterId: new ObjectId(eventClass.id)}, function (err) {
        if (err) {
          socket.emit("errorMessage", "Could not remove class. Try Refreshing Error Message: " + err.errmsg);
        }
        emitUpdatedUsersToAll();
      });
    });

    socket.on('edit class', function(eventClass) {
      ClassRoster.findByIdAndUpdate(eventClass.id, { name: eventClass.newName, nameLower: eventClass.newName.toLowerCase()}, function (err) {
        if (err) {
          socket.emit("errorMessage", "Could not edit class name. Try Refreshing Error Message: " + err.errmsg);
        }
        emitUpdatedUsersToAll();
        emitUpdatedRostersToAll();
      });
    });

    socket.on('get roster', function(day) {
      ParticipantSchedule.aggregate({$match: {day: day}}, {$group: {_id:{"classrosterId":"$classrosterId", "day" : "$day", "startTime": "$startTime"}, endTime: {$first: '$endTime'}, number : {$sum:1}}}, {$project: {classrosterId:'$_id.classrosterId', day: '$_id.day', startTime: '$_id.startTime', endTime: '$endTime', num: '$number'}}).exec(function(err, rosters) {
        if (err) {
          socket.emit("errorMessage", "Could not get roster list. Try Refreshing Error Message: " + err.errmsg);
        }
        ParticipantSchedule.populate(rosters, {path: 'classrosterId'}, function(err, rosters) {
          if (err) {
            socket.emit("errorMessage", "Could not get roster list. Try Refreshing Error Message: " + err.errmsg);
          }
           socket.emit('rosterlist', rosters);
        });
      });
    });

    socket.on('get rosterparticipants', function(roster) {
      ParticipantSchedule.find({classrosterId: roster.classrosterId._id, startTime: roster.startTime, day: roster.day}).populate('participantId').exec(function (err, rosters) {
        if (err) {
          socket.emit("errorMessage", "Could not get rosters. Try Refreshing Error Message: " + err.errmsg);
        }
        socket.emit('rosterparticipants', rosters);
      });
    });

  });

  return io; // so it can be used in app.js ( if need be )
}

function getNumberFromDay(day) {
  if (day.toLowerCase() === "monday") {
    return 0;
  } else if (day.toLowerCase() === "tuesday") {
    return 1;
  } else if (day.toLowerCase() === "wednesday") {
    return 2;
  } else if (day.toLowerCase() === "thursday") {
    return 3;
  } else if (day.toLowerCase() === "friday") {
    return 4;
  }
}

function emitUpdatedUsers(socket) {
  Participant.find({}, null, {sort: {nameLower:1}}, function(err, participants) {
    socket.emit('userlist', participants);
  });
}
function emitUpdatedRosters(socket) {
  ClassRoster.find({}, null, {sort: {nameLower:1}}, function(err, participants) {
    socket.emit('classrosterlist', participants);
  });
}

function emitUpdatedUsersToAll() {
  Participant.find({}, null, {sort: {nameLower:1}}, function(err, participants) {
    io.emit('userlist', participants);
  });
}
function emitUpdatedRostersToAll() {
  ClassRoster.find({}, null, {sort: {nameLower:1}}, function(err, participants) {
    io.emit('classrosterlist', participants);
  });
}