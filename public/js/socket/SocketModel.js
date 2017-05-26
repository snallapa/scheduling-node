var Emitter = (function () {
	var socket;

	function init(initSocket) {
		socket = initSocket;
	}

	function getSchedule(id) {
		socket.emit('get schedule', id);
	}

	function clearSchedule (id) {
		socket.emit("clear schedule", userlist[indexOfList]._id);
	}

	function addParticipant(name) {
		socket.emit('new participant', {name: name});
	}

	function editParticipant(name, newName) {
		socket.emit('edit participant', {name: name, newName:newName});
	}

	function removeParticipant(name, id) {
		socket.emit('remove participant', {name: name, id:id});
	}

	function newClass(name, location, max) {
		socket.emit('new class', {name: name, location : location, max : max});
	}

	function deleteClass(id, classEvent) {
		socket.emit('delete schedule', {participantid: id, classEvent: classEvent});
	}

	function saveClass(id, classEvent) {
		socket.emit('save schedule', {participantid: id, classEvent: classEvent});
	}

	return {
		init: init,
		getSchedule: getSchedule,
		clearSchedule: clearSchedule,
		addParticipant: addParticipant,
		editParticipant: editParticipant,
		removeParticipant: removeParticipant,
		newClass: newClass,
		deleteClass: deleteClass,
		saveClass: saveClass
	};

}) ();

var SocketModel = (function () {
	var socket;
	var controller;
	var emitter;

	function init (initController, initEmitter) {
		controller = initController;
		socket = io();
		initEmitter.init(socket);
		bindSocketEvents();
	}

	function bindSocketEvents() {
		socket.on("errorMessage", function(error) {
			controller.error(error);
		});

		socket.on("userlist", function(serverUserlist) {
			controller.newParticipants(serverUserlist);
		});

		socket.on("classlist", function(classList){
			controller.newClasses(classList);
		});

		socket.on('schedule change', function(returnMessage) {
			var participantId = returnMessage.Id;
			var forceUpdate = returnMessage.forceUpdate;
			controller.scheduleChange(forceUpdate, participantId);
		});

		socket.on("participant schedule", function(schedule) {
			controller.newSchedule(schedule);
		});
	}

	return {
		init: init
	};

}) ();  