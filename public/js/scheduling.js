/// <reference path="../../typings/jquery/jquery.d.ts"/>
var userlist = [];
var classrosterlist = [];
var savedSchedule =[[],[],[],[],[],[],];
//please do not change in js (supposed to be final)
var LIST_THRESHOLD_VALUE = 8;
MAX_ROWS = 6;
MAX_COLUMNS = 6;
var indexOfList;
var socket;
var classNameSaving;
var classToDelete;
var skipSave = false;

$(document).ready( function () {

	//hide all alerts so they can be changed after
	$(".alert").hide();
	$(".alert").slideUp();


	
});


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

function saveLocalData() {
	localStorage.setItem(LOCAL_STORAGE_STRING, indexOfList.toString());
}

