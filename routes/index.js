var express = require('express');
var passport = require('passport');
var Participant = require('../models/participant');
var ParticipantSchedule = require('../models/participantschedule')
var socket = require('socket.io');
var router = express.Router();
var JSZip = require("jszip");
var ObjectId = require('mongoose').Types.ObjectId;

/* GET home page. */
router.get('/', function (req, res, next) {
    /*
     User.register(new User({username: "username"}), "password", function(err) {
     if (err) {
     console.log('error while user register!', err);
     return next(err);
     }

     console.log('user registered!');
     });*/
    res.render('index');
});

/* All Gets */

//get for scheduling page
router.get('/scheduling', function (req, res, next) {
    if (req.user) {
        res.render('scheduling');
    } else {
        res.redirect('/');
    }

});

router.get('/rosters', function (req, res, next) {
    if (req.user) {
        res.render('rosters');
    } else {
        res.redirect('/');
    }

});

router.get('/classes', function (req, res, next) {
    if (req.user) {
        res.render('classes');
    } else {
        res.redirect('/');
    }
});

function convertScheduleToCsv(schedule) {
    var file = "";
    var times = ["9:30 - 10:30", "10:30 - 11:30", "11:30 - 12:00", "12:00 - 12:30", "12:30 - 1:30", "1:30 - 2:30"];
    var startTimes = ["9:30", "10:30", "11:30", "12:00", "12:30", "1:30"];
    var printSchedule = [];
    for (var row = 0; row < times.length; row++) {
        var newRow = [];
        newRow.push(times[row]);
        for (var i = 0; i < 5; i++) {
            newRow.push("");
        }
        printSchedule.push(newRow);
    }
    for (var i = 0; i < schedule.length; i++) {
        printSchedule[startTimes.indexOf(schedule[i].startTime)][schedule[i].day + 1] = schedule[i].classrosterId.name;
    }
    var csv = "Times, Monday, Tuesday, Wednesday, Thursday, Friday\n";
    printSchedule.forEach(function (row) {
        csv += row.join(',');
        csv += "\n";
    });
    return csv;
}

router.get('/export', function (req, res, next) {
    if (req.user) {
        Participant.find({}, function (err, participants) {
            var zip = new JSZip();
            var counter = 0;
            participants.forEach(function (participant) {
                ParticipantSchedule.find({participantId: new ObjectId(participant._id)}).populate('classrosterId').exec(function (err, schedule) {
                    var csv = convertScheduleToCsv(schedule);
                    zip.file(participant.name + ".csv", csv);
                    counter++;
                    if (counter === participants.length) {
                        zip
                            .generateNodeStream({type: 'nodebuffer', streamFiles: true})
                            .pipe(res);
                    }
                });
            });
        });
    } else {
        res.redirect('/');
    }
});

function convertRosterToCsv(roster, participants) {
    var csv = "Class: " + roster.classrosterId.name + "\n";
    var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    csv += "Day: " + days[roster.day] + "\n";
    csv += "Time: " + roster.startTime + " - " + roster.endTime + "\n";
    csv += "Room: " + roster.classrosterId.location + "\n";
    csv += "\n\nParticipant\n";
    for (var i = 0; i < participants.length; i++) {
        csv += participants[i].participantId.name + "\n";
    }
    if (roster.classrosterId.maxNumber) {
        csv += "\n\nCapped at " + roster.classrosterId.maxNumber + " people";
    }
    return csv;
}

router.get('/exportrosters', function (req, res, next) {
    if (req.user) {
        ParticipantSchedule.aggregate({
            $group: {
                _id: {
                    "classrosterId": "$classrosterId",
                    "day": "$day",
                    "startTime": "$startTime"
                },
                endTime: {$first: '$endTime'},
                location: {$first: '$location'},
                max: {$first: '$max'},
                number: {$sum: 1}
            }
        }, {
            $project: {
                classrosterId: '$_id.classrosterId',
                day: '$_id.day',
                startTime: '$_id.startTime',
                endTime: '$endTime',
                location: '$location',
                num: '$number'
            }
        }).exec(function (err, rosters) {
            ParticipantSchedule.populate(rosters, {
                path: 'classrosterId',
                options: {sort: {nameLower: -1, startTime: -1}}
            }, function (err, rosters) {
                var counter = 0;
                var zip = new JSZip();
                rosters.forEach(function (roster) {
                    ParticipantSchedule.find({
                        classrosterId: roster.classrosterId._id,
                        startTime: roster.startTime,
                        day: roster.day
                    }).populate('participantId').exec(function (err, participants) {
                        var csv = convertRosterToCsv(roster, participants);
                        zip.file(roster.classrosterId.name + counter + ".csv", csv);
                        counter++;
                        if (counter === rosters.length) {
                            zip
                                .generateNodeStream({type: 'nodebuffer', streamFiles: true})
                                .pipe(res);
                        }
                    });
                });
            });
        });
    } else {
        res.redirect('/');
    }
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

/* All Posts */

router.post('/login', passport.authenticate('local', {
    successRedirect: 'scheduling',
    failureRedirect: '/'
}), function (req, res, next) {
});


module.exports = router;
