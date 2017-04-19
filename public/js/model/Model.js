var Model = (function () {
	var participants = [];
	var classes = [];
	var schedule = [];

	function addParticipant(newParticipant) {
		participants.push(newParticipant);
	}

	function clearParticipants () {
		participants = [];
	}

	function addClass(newClass) {
		classes.push(newClass);
	}

	function clearClasses() {
		classes = [];
	}

	function getParticipants() {
		return participants;
	}

	function getClasses() {
		return classes;
	}

	function clearSchedule() {
		schedule = [];
	}

	function addSchedule(classEvent) {
		schedule.push(classEvent);
	}

	function getSchedule() {
		return schedule;
	}

	return {
		addParticipant: addParticipant,
		clearParticipants: clearParticipants,
		addClass: addClass,
		clearClasses: clearClasses,
		getParticipants: getParticipants,
		getClasses: getClasses,
		addSchedule: addSchedule,
		getSchedule: getSchedule,
		clearSchedule: clearSchedule
	};

}) ();