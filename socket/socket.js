var Participant = require('../models/participant');
var ParticipantSchedule = require('../models/participantschedule');
var ClassRoster = require('../models/classroster');
var ObjectId = require('mongoose').Types.ObjectId;
var io;
module.exports = function(server) {
  io = require('socket.io')(server);

  // catch errors
  io.on('error', function(err) {
    throw err;
  });


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
      ClassRoster.findById(classEvent.classrosterid, function(err, classroster) {
        if (err) {
          socket.emit("errorMessage", "Could not save schedule (bad class?). Try Refreshing Error Message: " + err.errmsg);
        } else {
          max = classroster.maxNumber;
          ParticipantSchedule.find({day:classEvent.day, startTime: classEvent.startTime, endTime: classEvent.endTime, classrosterId:new ObjectId(classEvent.classrosterid)}).count(function(err, count) {
            if (err) {
              socket.emit("errorMessage", "Could not save schedule (bad class?). Try Refreshing Error Message: " + err.errmsg);
            } else {
              if (!max || count < max) {
                ParticipantSchedule.findOneAndUpdate({participantId:new ObjectId(participant.participantid), day:classEvent.day, startTime: classEvent.startTime, endTime: classEvent.endTime}, {classrosterId: new ObjectId(classEvent.classrosterid)}, {upsert:true}, function(err) {
                  if (err) {
                    socket.emit("errorMessage", "Could not save schedule. Try Refreshing Error Message: " + err.errmsg);
                  }
                  io.emit('schedule change', {Id:participant.participantid, forceUpdate:false});
                });
              } else {
                socket.emit("errorMessage", "Reached class limit either remove a person or raise limit");

              }
            }
          });
        }
      });
    });

    //delete a class from a schedule
    socket.on('delete schedule', function(participant) {
      var classEvent = participant.classEvent;
      ParticipantSchedule.remove({participantId:new ObjectId(participant.participantid), day:classEvent.day, startTime: classEvent.startTime, endTime: classEvent.endTime}, function(err) {
        if (err) {
          socket.emit("errorMessage", "Could not save schedule. Try Refreshing Error Message: " + err.errmsg);
        }
        io.emit('schedule change', {Id:participant.participantid, forceUpdate:false});
      });
    });

    //delete a person from a class
    socket.on('delete roster', function(roster) {
      var classEvent = roster.classEvent;
      ParticipantSchedule.remove({participantId:new ObjectId(roster.participantid), day:classEvent.day, startTime: classEvent.startTime, endTime: classEvent.endTime}, function(err) {
        if (err) {
          socket.emit("errorMessage", "Could not save schedule. Try Refreshing Error Message: " + err.errmsg);
        }
        io.emit('schedule change', {Id:roster.participantid, forceUpdate:false});
      });
    });

    //save roster
    socket.on('save roster', function(roster) {
      var classEvent = roster.classEvent;
      ClassRoster.findById(classEvent.classrosterid, function(err, classroster) {
        if (err) {
          socket.emit("errorMessage", "Could not save schedule (bad class?). Try Refreshing Error Message: " + err.errmsg);
        } else {
          max = classroster.maxNumber;
          ParticipantSchedule.find({day:classEvent.day, startTime: classEvent.startTime, endTime: classEvent.endTime, classrosterId:new ObjectId(classEvent.classrosterid)}).count(function(err, count) {
            if (err) {
              socket.emit("errorMessage", "Could not save schedule (bad class?). Try Refreshing Error Message: " + err.errmsg);
            } else {
              if (!max || count < max) {
                ParticipantSchedule.findOneAndUpdate({participantId:new ObjectId(roster.participantid), day:classEvent.day, startTime: classEvent.startTime, endTime: classEvent.endTime}, {classrosterId: new ObjectId(classEvent.classrosterid)}, {upsert:true}, function(err) {
                  if (err) {
                    socket.emit("errorMessage", "Could not save schedule. Try Refreshing Error Message: " + err.errmsg);
                  }
                  io.emit('schedule change', {Id:classEvent.classrosterid, forceUpdate:false});
                });
              } else {
                socket.emit("errorMessage", "Reached class limit either remove a person or raise limit");
              }
            }
          });
        }
      });
    });

    //edit participant
    socket.on('edit participant', function(newValue){
      Participant.update({nameLower:newValue.name.toLowerCase()}, {name: newValue.newName, nameLower: newValue.newName.toLowerCase()}, function (err) {
        if (err) {
          socket.emit("errorMessage", "Could not edit Participant. Try Refreshing Error Message: " + err.errmsg);
        }
        emitUpdatedUsersToAll();
        io.emit('schedule change', {Id:undefined, forceUpdate:false});
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
        io.emit('schedule change', {Id:undefined, forceUpdate:false});
        emitUpdatedRostersToAll();
      });
    });

    //add new class
    socket.on('new class', function(event) {
      ClassRoster.create({ name: event.name, nameLower:event.name.toLowerCase(), location: event.location, locationLower: event.location.toLowerCase(), maxNumber: event.max}, function (err) {
        if (err) {
          socket.emit("errorMessage", "Could not add Class (possible duplicate?). Try Refreshing Error Message: " + err.errmsg);
        }
        emitUpdatedRostersToAll();
      });
    });

    //return schedule of participant
    socket.on('get schedule', function(participantId) {
      ParticipantSchedule.find({participantId:new ObjectId(participantId)}).populate('classrosterId').exec(function (err, schedule) {
        if (err) {
          socket.emit("errorMessage", "Could not get schedule for this participant. Try Refreshing Error Message: " + err.errmsg);
        }
        socket.emit('participant schedule', schedule);
      });
    });

    //when a schedule is cleared
    socket.on('clear schedule', function(participantId) {
      ParticipantSchedule.remove({participantId:new ObjectId(participantId)}, function(err) {
        if (err) {
          socket.emit("errorMessage", "Could not remove class. Try Refreshing Error Message: " + err.errmsg);
        }
        io.emit('schedule change', {Id:participantId, forceUpdate:false});
      });
    });

    //delete a class and all associating schedules
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
        io.emit('schedule change', {Id:undefined, forceUpdate:true});
        emitUpdatedUsersToAll();
      });
    });

    //edit a class 
    socket.on('edit class', function(eventClass) {
      ClassRoster.findByIdAndUpdate(eventClass.id, { name: eventClass.newName, nameLower: eventClass.newName.toLowerCase(), location:eventClass.newLocation, locationLower:eventClass.newLocation.toLowerCase(), maxNumber:eventClass.newMax}, function (err) {
        if (err) {
          socket.emit("errorMessage", "Could not edit class name. Try Refreshing Error Message: " + err.errmsg);
        }
        emitUpdatedUsersToAll();
        emitUpdatedRostersToAll();
        io.emit('schedule change', {Id:undefined, forceUpdate:true});
      });
    });

    //get rosters for a day
    socket.on('get roster', function(day) {
      //tested this aggregate to group data by class and day
      ParticipantSchedule.aggregate({$match: {day: day}}, {$group: {_id:{"classrosterId":"$classrosterId", "day" : "$day", "startTime": "$startTime"}, endTime: {$first: '$endTime'}, location: {$first: '$location'}, max: {$first: '$max'}, number : {$sum:1}}}, {$project: {classrosterId:'$_id.classrosterId', day: '$_id.day', startTime: '$_id.startTime', endTime: '$endTime', location:'$location', num: '$number'}}).exec(function(err, rosters) {
        if (err) {
          socket.emit("errorMessage", "Could not get roster list. Try Refreshing Error Message: " + err.errmsg);
        }
        ParticipantSchedule.populate(rosters, {path: 'classrosterId', options:{sort:{nameLower: -1, startTime:-1}}}, function(err, rosters) {
          if (err) {
            socket.emit("errorMessage", "Could not get roster list. Try Refreshing Error Message: " + err.errmsg);
          }
          socket.emit('rosterlist', rosters);
        });
      });
    });

    //get the actual class roster
    socket.on('get rosterparticipants', function(roster) {
      ParticipantSchedule.find({classrosterId: roster.classrosterId._id, startTime: roster.startTime, day: roster.day}).populate('participantId').exec(function (err, rosters) {
        if (err) {
          socket.emit("errorMessage", "Could not get rosters. Try Refreshing Error Message: " + err.errmsg);
        }
        socket.emit('rosterparticipants', rosters);
      });
    });

    //delete all classes
    socket.on('clear classes', function() {
      ClassRoster.remove({}, function(err) {
        if (err) {
          socket.emit("errorMessage", "Could not delete all classes. Try Refreshing Error Message: " + err.errmsg);
        }
        ParticipantSchedule.remove({}, function(err) {
          if (err) {
            socket.emit("errorMessage", "Could not delete all classes. Try Refreshing Error Message: " + err.errmsg);
          }
          emitUpdatedUsersToAll();
          emitUpdatedRostersToAll();
          io.emit('schedule change', {Id:undefined, forceUpdate:true});
        });
      });
    });

    socket.on('clear roster', function(roster) {
      console.log(roster);
      ParticipantSchedule.remove({day: roster.day, startTime: roster.startTime, endTime: roster.endTime, classrosterId:new ObjectId(roster.classrosterId)}, function(err) {
        if (err) {
          socket.emit("errorMessage", "Could not delete roster. Try Refreshing Error Message: " + err.errmsg);
        }
        emitUpdatedRostersToAll();
        io.emit('schedule change', {Id:undefined, forceUpdate:true});
      });
    });
  });

  return io; // so it can be used in app.js ( if need be )
}

//helper functions to send data to all or one user
function emitUpdatedUsers(socket) {
  Participant.find({}, null, {sort: {nameLower:1}}, function(err, participants) {
    socket.emit('userlist', participants);
  });
}
function emitUpdatedRosters(socket) {
  ClassRoster.find({}, null, {sort: {nameLower:1}}, function(err, participants) {
    socket.emit('classlist', participants);
  });
}

function emitUpdatedUsersToAll() {
  Participant.find({}, null, {sort: {nameLower:1}}, function(err, participants) {
    io.emit('userlist', participants);
  });
}
function emitUpdatedRostersToAll() {
  ClassRoster.find({}, null, {sort: {nameLower:1}}, function(err, participants) {
    io.emit('classlist', participants);
  });
}