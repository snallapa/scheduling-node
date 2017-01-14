/// <reference path="../../typings/jquery/jquery.d.ts"/>
var userlist = [];
var classrosterlist = [];
var savedSchedule =[[],[],[],[],[],[],];
//please do not change in js (supposed to be final)
var LOCAL_STORAGE_STRING = "list_item_place";
var LIST_THRESHOLD_VALUE = 8;
MAX_ROWS = 6;
MAX_COLUMNS = 6;
var indexOfList;
var socket;
var classNameSaving;
var classToDelete;
var skipSave = false;

$(document).ready( function () {

	//connection to socket
	socket = io();

	//show error messages from server
	socket.on("errorMessage", function(error) {
		alert(error);
	});

	//list of participants from server
	socket.on("userlist", function(serverUserlist) {
		userlist = serverUserlist;
		$("#search").val("");
		updateParticipantList(userlist);
		$("#participantChosen").trigger("click");
	});

	//list of classes for auto complete
	socket.on("classlist", function(classList){
		classrosterlist = classList;
		$( "textarea" ).not("#search").autocomplete({
			source: classrosterlist.map(function(roster){
				label = roster.name + "\n" + roster.location + ": ";
				label = !roster.maxNumber ? label + "No Max" : roster.maxNumber;
				return {value: label, label: label};
			})
		});
	});

	//if another user changed the current users schedule
	socket.on('schedule change', function(returnMessage) {
		var participantId = returnMessage.Id;
		var forceUpdate = returnMessage.forceUpdate;
		if (forceUpdate || userlist[indexOfList]._id === participantId) {
			socket.emit('get schedule', userlist[indexOfList]._id);
		}
	});

	//when the schedule is received load it
	socket.on("participant schedule", function(schedule) {
		loadSchedule(schedule);
	});

	//hide all alerts so they can be changed after
	$(".alert").hide();
	$(".alert").slideUp();

	//saved index of list
	indexOfList = parseInt(localStorage.getItem(LOCAL_STORAGE_STRING));
	if (indexOfList === null) {
		indexOfList = 0;
	}

	//clicked inside of participant list
	$("div").on("click",".itemData", function (event) {
		$(".itemData:eq(" + indexOfList + ")").removeClass("active");
		$(".itemData:eq(" + indexOfList + ")").removeAttr('id');
		indexOfList = $(this).index();
		saveLocalData();
		$(".itemData:eq(" + indexOfList + ")").addClass("active");
		$(".itemData:eq(" + indexOfList + ")").attr("id", "participantChosen");
		socket.emit('get schedule', userlist[indexOfList]._id);
	});

	//show and fill edit modal
	$("div").on('click', ".editParticipant", function (event) {
		event.stopImmediatePropagation();
		$("#newParticipantName").val($("#participantChosen").text());
		$('#editModal').modal();
	});

	//focus on the right text field when modals come up
	$('#newParticipantModal').on('shown.bs.modal', function () {
		$('#name').focus();
	});
	$('#editModal').on('shown.bs.modal', function () {
		$('#newParticipantName').focus();
	});

	//submitting and sending information from modal
	$(".editParticipantButton").click(function () {
		var newName = $("#newParticipantName").val();
		if (newName === "") {
			$(".residentNotEdited").slideDown().delay(3000)
			.slideUp();
		}
		else {
			socket.emit('edit participant', {name: $("#participantChosen > .participantName").html(), newName:newName});
			$("#newParticipantName").val("");
			$('#editModal').modal('hide');
			$("#search").val("");
		}
	});

	//enter submits modal forms
	$(document).keypress(function (e) {
		if (e.which == 13) {
			e.preventDefault();
			if(($("#newParticipantModal").data('bs.modal') || {}).isShown) {
				$(".addParticipantButton").trigger("click");
			} else if (($("#editModal").data('bs.modal') || {}).isShown) {
				$(".editParticipantButton").trigger("click");	
			}
		}
	});

	//add new user
	$(".addParticipantButton").click(function () {
		var name = $("#name").val();
		if (name === "") {
			$(".participantNotAdded").slideDown().delay(3000)
			.slideUp();
		} else {
			socket.emit('new participant', {name: name});
			$("#name").val("");
			$('#newParticipantModal').modal('hide');
			$("#search").val("");
		}
	});

	//close button on all warning
	$(".closeWarning").click(function () {
		$(".alert").slideUp();
	});

	//Clearing Schedule
	$(".actuallyClearSchedule").click(function () {
		$(".alert").slideUp();
		socket.emit("clear schedule", userlist[indexOfList]._id);

	});

	//when the clear schedule is brought down
	$(".clearSchedule").click(function () {
		$(".clearWarning").slideDown();
	});

	//Removing Resident
	$("div").on('click', ".removeParticipant", function (event) {
		event.stopImmediatePropagation();
		$(".residentWarning").slideDown();
	});

	//send message to server to remove resident
	$(".actuallyRemoveResident").click( function () {
		$(".alert").slideUp();
		socket.emit('remove participant', {name: $("#participantChosen > .participantName").html(), id:userlist[indexOfList]._id});
	});

	//editable table widget
	$('#schedule').editableTableWidget({
		editor: $('<textarea>')
	});

	$('#schedule').editableTableWidget({
		cloneProperties: ['background', 'border', 'outline']
	});

	//validating name just no long names also save names that should be deleted
	$('table td').on('validate', function (evt, newValue) {
		var cell = $(this);
		var col = cell.parent().children().index(cell);
		var row = cell.parent().parent().children().index(cell.parent());
		if (col === 0) {
			return false;
		} if (newValue.trim() === "") {
			classToDelete = savedSchedule[row][col]; 
		}
		else {
			return newValue.trim().length < 65;
		}
	});

	//when it actually gets entered save the schedule
	$('table td').on('change', function (evt, newValue) {
		var cell = $(this);
		var tableRows = $("#schedule").find('tbody').find('tr');
		var col = cell.parent().children().index(cell);
		var row = cell.parent().parent().children().index(cell.parent());
		var wholeName = $(tableRows[row]).find('td:eq(' + col + ')').html() + "";
		savedSchedule[row][col] = wholeName;
		var className = wholeName.substring(0,wholeName.indexOf(":")).trim();
		var maxNumber = wholeName.substring(wholeName.indexOf(":") + 1).trim();
		maxNumber = parseInt(maxNumber);
		if (!Number.isInteger(maxNumber)) {
			maxNumber = null;
		}
		$(tableRows[row]).find('td:eq(' + col + ')').html(className)
		if (!skipSave) {
			saveSchedule($(this), className, maxNumber);
			skipSave = true;
		} else {
			skipSave = false;
		}

	});

	//export functionality
	$(".exportSchedule").click(function () {
		var tableElement = $("#schedule").clone();
		tableElement.find("tfoot").remove();
		var table = tableElement.html();
		var participantName = $("#participantChosen").text();
		var exportWindow = window.open("export","Export", '');
		exportWindow.onload = function() {
			exportWindow.document.getElementById('header').innerHTML = participantName + "'s Schedule";
			exportWindow.document.getElementById('schedule').innerHTML = table;
		};
	});

	$('#addClass').on('shown.bs.modal', function () {
		$('#newName').focus();
		$('#newName').val(classNameSaving);
	});

	$('.clearModalButton').click(function() {
		$('.addClassWarning').slideUp();
	});

	//Adding a class if user enters a class not added yet
	$(".addClassButton").click(function () {
		var name = $("#newName").val().trim();
		var location = $("#location").val().trim();
		var max = $("#max").val().trim();
		if (name === "" || (max != '' && isNaN(parseInt(max)))) {
			$(".classNotAdded").slideDown().delay(3000)
			.slideUp();
		} else {
			max = parseInt(max);
			socket.emit('new class', {name: name, location : location, max : max});
			$("#name").val("");
			$("#location").val("");
			$("#max").val("");
			$('#addClass').modal('hide');
			$("#search").val("");
			$('.addClassWarning').slideUp();
		}
	});

	//search html way for list
	$('#search').hideseek();
});

//create the participant list adding html element by user
function updateParticipantList (userlist) {
	var currentParticipantName = $("#participantChosen > .participantName").html();
	if (currentParticipantName) {
		indexOfList = -1;
	}
	$(".itemData").remove();
	for (var i = 0; i < userlist.length; i++) {
		if (i == indexOfList || userlist[i].name === currentParticipantName) {
			$(".list-group").append('<div id="participantChosen" class="list-group-item active itemData"></div>');
			$(".itemData:eq(" + i + ")").append('<p class="participantName list-item-inline participantName">' + userlist[i].name + '</p>');
			$(".itemData:eq(" + i + ")").append('<a title="Remove Participant" class="removeParticipant list-item-inline "><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>');
			$(".itemData:eq(" + i + ")").append('<a title="Edit Participant" href="#" class="editParticipant list-item-inline"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>');
			indexOfList = i;
		}
		else {
			$(".list-group").append('<div class="list-group-item itemData"></div>');
			$(".itemData:eq(" + i + ")").append('<p class="list-item-inline participantName">' + userlist[i].name + '</p>');
			$(".itemData:eq(" + i + ")").append('<a title="Remove Participant" class="removeParticipant list-item-inline"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>');
			$(".itemData:eq(" + i + ")").append('<a title="Edit Participant" class="editParticipant list-item-inline"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>');

		}
	}
	if (indexOfList == -1) {
		indexOfList = 0;
		updateParticipantList(userlist);
	}
}

//when a schedule comes in load it by finding the right cell
function loadSchedule(schedule) {
	var tableRows = $("#schedule").find('tbody').find('tr');
	$('.clearable').html("");

	for (var i = 1; i < MAX_COLUMNS;i++) {
		// start at 1 so dont get time column
		var day = getNumberFromDay($('th:eq(' + i + ')').html().toLowerCase());

		for(var j = 0; j < MAX_ROWS;j++) {

			var time = $(tableRows[j]).find('td:eq(0)').html();
			time = time.split("-");
			time[0] = time[0].trim();
			time[1] = time[1].trim();
			for(var k = 0; k < schedule.length; k++) {
				var event = schedule[k];
				if(event.startTime === time[0] && event.day === day) {
					//null check on classrosterid can be null if class is deleted or just not filled
					if (event.classrosterId) {
						if(event.classrosterId.location) {
							$(tableRows[j]).find('td:eq(' + i + ')').html(event.classrosterId.name + "\n" + event.classrosterId.location);
						} else {
							$(tableRows[j]).find('td:eq(' + i + ')').html(event.classrosterId.name);
						}
						savedSchedule[j][i] = event.classrosterId.name + "\n" + event.classrosterId.location + ": " + event.classrosterId.maxNumber;
					}
				}
			}
		}
	}
}

//when a  new schedule is entered save it by saving the specific cell value
function saveSchedule(cell, className, maxNumber) {
	var col = cell.parent().children().index(cell);
	var row = cell.parent().parent().children().index(cell.parent());
	var tableRows = $("#schedule").find('tbody').find('tr');
	className = decodeEntity(className.toLowerCase()).split("\n");
	className[1] = className[1] === undefined ? "" : className[1];
	var time = $(tableRows[row]).find('td:eq(0)').html();
	time = time.split("-");
	time[0] = time[0].trim();
	time[1] = time[1].trim();
	var day = $('th:eq(' + col + ')').html();
	var classid;

	//we need to delete the class
	if (className[0].trim() === "") {
		var classDeleteName = classToDelete.toLowerCase().substring(0,classToDelete.indexOf(":")).trim();
		classDeleteName = decodeEntity(classDeleteName).split("\n");
		classDeleteName[1] = classDeleteName[1] === undefined ? "" : classDeleteName[1];
		var deleteMaxNumber = classToDelete.substring(classToDelete.indexOf(":") + 1).trim();
		var deleteMaxNumber = parseInt(deleteMaxNumber);
		if (!Number.isInteger(deleteMaxNumber)) {
			deleteMaxNumber = null;
		}
		for (var i = 0; i < classrosterlist.length; i++) {

			if (classrosterlist[i].nameLower === classDeleteName[0] 
				&& classrosterlist[i].locationLower === classDeleteName[1]
				&& deleteMaxNumber === classrosterlist[i].maxNumber) {
				classid = classrosterlist[i]._id;
				break;
			}
		}
		classEvent = {day: day, startTime: time[0], endTime:time[1],classrosterid:classid};
		var id = userlist[indexOfList]._id;

		socket.emit('delete schedule', {participantid: id, classEvent: classEvent});
	} else {
		//save the class or tell the user that they entered a wrong class
		for (var i = 0; i < classrosterlist.length; i++) {
			if (classrosterlist[i].nameLower === className[0]
				&& classrosterlist[i].locationLower === className[1]
				&& maxNumber === classrosterlist[i].maxNumber) {
				classid = classrosterlist[i]._id;
				break;
			}
		}
		if (classid == null) {
			$('.addClassWarning').slideDown();
			classNameSaving = className;
			return;
		}
		classEvent = {day: day, startTime: time[0], endTime:time[1],classrosterid:classid};
		var id = userlist[indexOfList]._id;

		socket.emit('save schedule', {participantid: id, classEvent: classEvent});
	}
	
}

//helper function to convert server day to string day
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

//helper function for html entities (&)
function decodeEntity(className) {
	return $('<textarea />').html(className).text();
}

function saveLocalData() {
	localStorage.setItem(LOCAL_STORAGE_STRING, indexOfList.toString());
}

