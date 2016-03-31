var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var Participant = require('../models/participant');
var ClassRoster = require('../models/classroster');
var socket = require('socket.io');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});

/* All Gets */

//get for scheduling page
router.get('/scheduling', function(req, res, next) {
	if (req.user) {
		Participant.find({}, function(err, participants) {
			if (err) {
				res.status(500).send('Could not get Participants');
			}
			res.render('scheduling', {participants: participants});
		});
		
	} else {
		res.redirect('/');
	}
	
});

router.get('/rosters', function(req, res, next) {
	if (req.user) {
		ClassRoster.find({}, function(err, classrosters) {
			if (err) {
				res.status(500).send('Could not get Rosters');
			}
			res.render('rosters', {classrosters: classrosters});
		});
		
	} else {
		res.redirect('/');
	}
	
});

router.get('/classes', function(req, res, next) {
	if (req.user) {
		res.render('classes');
	} else {
		res.redirect('/');
	}
	
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

router.get('/participants', function(req, res) {

});
/* All Posts */

/*
router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }), req.body.password, function(err, account) {
    	console.log(req.body.username);
        if (err) {
            return res.render('/');
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});
*/

router.post('/login', passport.authenticate('local', {successRedirect:'scheduling', failureRedirect:'/'}), function(req, res, next) {
});

/*
router.post('/scheduling', function(req,res){
	var newParticipant = new Participant({name:req.body.name});
	newParticipant.save(function (err) {
		if (err) {
			res.status(500).send({error: "Participant could not be added"});
		}
		res.status(200).end();
	})
});
*/


module.exports = router;
