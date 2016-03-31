/// <reference path="../../typings/jquery/jquery.d.ts"/>
var userlist = [];
var classrosterlist = [];
//please do not change in js (supposed to be final)
var LOCAL_STORAGE_STRING = "list_item_place";
var LIST_THRESHOLD_VALUE = 8;
MAX_ROWS = 6;
MAX_COLUMNS = 6;
var indexOfList;
var QUERY_LIMIT = 1000;//max query limit for parse
var socket;

$(document).ready( function () {

	//connection to socket
	socket = io();

	//show error messages from server
	socket.on("errorMessage", function(error){
		alert(error);
	});

	socket.on("userlist", function(serverUserlist) {
		userlist = serverUserlist;
		$("#search").val("");
		updateParticipantList(userlist);
		$("#participantChosen").trigger("click");
	});

	socket.on("classrosterlist", function(rosterUserList){
		classrosterlist = rosterUserList;
		$( "textarea" ).not("#search").autocomplete({
			source: classrosterlist.map(function(roster){
				return roster.name;
			})
		});
	});

	socket.on('schedule change', function(participantId) {
		var currentParticipantName = $("#participantChosen > .participantName").html();
		if (userlist[indexOfList]._id === participantId) {
			socket.emit('getSchedule', userlist[indexOfList]._id);
		}
	});

	socket.on("participant schedule", function(schedule) {
		loadSchedule(schedule);
	});

	$(".alert").hide();
	$(".alert").slideUp();

	//saved index of list
	indexOfList = localStorage.getItem(LOCAL_STORAGE_STRING);
	if (indexOfList === null) {
		indexOfList = 0;
	}

	//save the index of list when tab closes
	$(window).unload(function () {
		localStorage.setItem(LOCAL_STORAGE_STRING, indexOfList.toString());
		return "Bye now!";
	});

	//clicked inside of participant list
	$("div").on("click",".itemData", function (event) {
		$(".itemData:eq(" + indexOfList + ")").removeClass("active");
		$(".itemData:eq(" + indexOfList + ")").removeAttr('id');
		indexOfList = $(this).index();
		$(".itemData:eq(" + indexOfList + ")").addClass("active");
		$(".itemData:eq(" + indexOfList + ")").attr("id", "participantChosen");
		socket.emit('getSchedule', userlist[indexOfList]._id);
	});

	//show and fill edit modal
	$("div").on('click', ".editParticipant", function (event) {
		event.stopImmediatePropagation();
		$("#newName").val($("#participantChosen").text());
		$('#editModal').modal();
	});

	$('#myModal').on('shown.bs.modal', function () {
		$('#name').focus();
	});
	$('#editModal').on('shown.bs.modal', function () {
		$('#newName').focus();
	});

	$(".editUserButton").click(function () {
		var newName = $("#newName").val();
		if (newName === "") {
			$(".residentNotEdited").slideDown().delay(3000)
			.slideUp();
		}
		else {
			socket.emit('edit participant', {name: $("#participantChosen > .participantName").html(), newName:newName});
			$("#newName").val("");
			$('#editModal').modal('hide');
			$("#search").val("");
		}
	});

	//enter submits modal forms
	$(document).keypress(function (e) {
		if (e.which == 13) {
			e.preventDefault();
			if(($("#myModal").data('bs.modal') || {}).isShown) {
				$(".userButton").trigger("click");
			} else if (($("#editModal").data('bs.modal') || {}).isShown) {
				$(".editUserButton").trigger("click");	
			}
		}
	});

	//add new user
	$(".userButton").click(function () {
		var name = $("#name").val();
		if (name === "") {
			$(".participantNotAdded").slideDown().delay(3000)
			.slideUp();
		} else {
			socket.emit('new participant', {name: name});
			$("#name").val("");
			$('#myModal').modal('hide');
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
		$(".clearable").text("");
		savedSchedule();

	});

	$(".clearSchedule").click(function () {
		$(".clearWarning").slideDown();
	});

	//Removing Resident
	$("div").on('click', ".removeParticipant", function (event) {
		event.stopImmediatePropagation();
		console.log("removeResident");
		$(".residentWarning").slideDown();
	});

	$(".actuallyRemoveResident").click( function () {
		$(".alert").slideUp();
		socket.emit('remove participant', {name: $("#participantChosen > .participantName").html(), id:userlist[indexOfList]._id});
	});

	$('#schedule').editableTableWidget({
		editor: $('<textarea>')
	});

	$('#schedule').editableTableWidget({
		cloneProperties: ['background', 'border', 'outline']
	});

	$('table td').on('validate', function (evt, newValue) {
		var cell = $(this);
		var column = cell.index();
		if (column === 0) {
			return false;
		} else {
			return newValue.trim().length < 65;
		}
	});

	$('table td').on('change', function (evt, newValue) {
		savedSchedule($(this));

	});

	$(".exportSchedule").click(function () {
		var tableElement = $("#schedule").clone();
		tableElement.find("tfoot").remove();
		var table = tableElement.html();
		var participantName = $("#participantChosen").text();
		var exportWindow = window.open("export.html","Export", '');
		exportWindow.onload = function() {
			exportWindow.document.getElementById('header').innerHTML = participantName + "'s Schedule";
			exportWindow.document.getElementById('schedule').innerHTML = table;
		};
	});

	$('#search').hideseek();
});

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

function loadSchedule(schedule) {
	var tableRows = $("#schedule").find('tbody').find('tr');
	$('.clearable').html("");

	for (var i = 1; i < MAX_ROWS;i++) {
		// start at 1 so dont get time column
		var day = getNumberFromDay($('th:eq(' + i + ')').html().toLowerCase());

		for(var j = 0; j < MAX_COLUMNS;j++) {

			var time = $(tableRows[j]).find('td:eq(0)').html();
			time = time.split("-");
			time[0] = time[0].trim();
			time[1] = time[1].trim();
			for(var k = 0; k < schedule.length; k++) {
				var event = schedule[k];
				if(event.startTime === time[0] && event.day === day) {
					$(tableRows[j]).find('td:eq(' + i + ')').html(event.classrosterId.name);
				}
			}
		}
	}
}

function savedSchedule(cell) {
	var col = cell.parent().children().index(cell);
	var row = cell.parent().parent().children().index(cell.parent());
	var tableRows = $("#schedule").find('tbody').find('tr');
	var className = $(tableRows[row]).find('td:eq(' + col + ')').html();
	var time = $(tableRows[row]).find('td:eq(0)').html();
	time = time.split("-");
	time[0] = time[0].trim();
	time[1] = time[1].trim();
	var day = $('th:eq(' + col + ')').html();
	var classid;
	for (var i = 0; i < classrosterlist.length; i++) {
		if (classrosterlist[i].nameLower === className.toLowerCase()) {
			classid = classrosterlist[i]._id;
			break;
		}
	}
	if (classid == null) {
		return;
	}
	classEvent = {day: day, startTime: time[0], endTime:time[0],classrosterid:classid};
	var id = userlist[indexOfList]._id;

	socket.emit('save schedule', {participantid: id, classEvent: classEvent});
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

