var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var Participant = require('../models/participant');
var ClassRoster = require('../models/classroster');
var socket = require('socket.io');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
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
router.get('/scheduling', function(req, res, next) {
	if (req.user) {
		res.render('scheduling');
		
	} else {
		res.redirect('/');
	}
	
});

router.get('/rosters', function(req, res, next) {
	if (req.user) {
		res.render('rosters');		
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

router.get('/export', function(req, res, next) {
	if (req.user) {
		res.render('export');
	} else {
		res.redirect('/');
	}
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

/* All Posts */

router.post('/login', passport.authenticate('local', {successRedirect:'scheduling', failureRedirect:'/'}), function(req, res, next) {
});


module.exports = router;
