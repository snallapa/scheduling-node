var SchedulingTableView = (function () {
    var emitter;
    var currentParticipant;
    var classList;
    var classEntered;
    var savedSchedule;
    var MAX_COLUMNS;
    var MAX_ROWS;
    var enteredClassLocation;

    function init(initEmitter, initCurrentParticipant, initClassList, maxCol, maxRow) {
        emitter = initEmitter;
        currentParticipant = initCurrentParticipant;
        classList = initClassList;
        MAX_COLUMNS = maxCol;
        MAX_ROWS = maxRow;
        savedSchedule = {};
        bind();
    }

    function clearSchedule() {
        $(".alert").slideUp();
        emitter.clearSchedule(currentParticipant.id);
    }

    function exportSchedule() {
        if (!currentParticipant) {
            return;
        }
        window.open("export", "Export", '');
    }

    function addNewClass() { //wait so why is this here??
        var name = $("#newName").val().trim();
        var location = $("#location").val().trim();
        var max = $("#max").val().trim();
        if (name === "" || (max !== '' && isNaN(parseInt(max)))) {
            $(".classNotAdded").slideDown().delay(3000)
                .slideUp();
        } else {
            max = parseInt(max);
            emitter.newClass(name, location, max);
            $("#name").val("");
            $("#location").val("");
            $("#max").val("");
            $('#addClass').modal('hide');
            $("#search").val("");
            $('.addClassWarning').slideUp();
        }
    }

    function bind() {
        $(".actuallyClearSchedule").click(clearSchedule);

        $('#addClass').on('shown.bs.modal', function () {
            $('#newName').focus();
        });

        $('.clearModalButton').click(function () {
            $('.addClassWarning').slideUp();
        });

        $(".addClassButton").click();
    }

    function validate(evt, newValue) {
        var cell = $(this);
        var col = cell.parent().children().index(cell);
        var wellFormed = true;
        if (col === 0) {
            if (newValue.trim() === '') {
                wellFormed
            }
            else if (newValue.indexOf("-") !== -1) {
                var times = newValue.split("-");
                times[0] = times[0].trim();
                times[1] = times[1].trim();
                wellFormed = times[0].indexOf(":") !== -1 && times[1].indexOf(":") !== -1;

            } else {
                wellFormed = false;
            }
        }
        return wellFormed;
    }

    function onChange(evt, newValue) {
        var cell = $(this);
        var col = cell.parent().children().index(cell);
        var row = cell.parent().parent().children().index(cell.parent());
        if (col === 0) {
            changeSettings(newValue, row);
        } else if (row < MAX_ROWS) {
            saveSchedule(cell, (newValue.trim() === ""));
        }
    }

    function setupTable() {
        $('#schedule').editableTableWidget({
            editor: $('<textarea>')
        });

        $('#schedule').editableTableWidget({
            cloneProperties: ['background', 'border', 'outline']
        });

        $('table td').on('validate', validate);

        $('table td').on('change', onChange);

        $(".clearSchedule").click(function () {
            if (currentParticipant) {
                $(".clearWarning").slideDown();
            }
        });

        $(".exportSchedule").click(exportSchedule);

        $(".addRow").click(addRow);
    }
    
    function addRow() {
        console.log("here");
        $("tbody").append("<tr></tr>");
        var row = $("tbody tr:last");
        row.append("<td class='times'></td>");
        for (var j = 0; j < 5; j++) {
            row.append("<td class='clearable'></td>");
        }
        setupTable();
    }

    function onItemSelected(event, ui) {
        classEntered = ui.item.actualClass;
    }

    function setupAutocomplete(classes) {
        $("textarea").not("#search").autocomplete({
            source: classes.map(function (roster) {
                var value = roster.name + "\n" + roster.location;
                var label = value + ": " + (!roster.max ? "No Max" : roster.max);
                return {value: value, label: label, actualClass: roster};
            })
        });
        $("textarea").not("#search").on("autocompleteselect", onItemSelected);
        $("textarea").not("#search").on("autocompletefocus", onItemSelected);
    }
    $(".clearable").click(function(){
        var row = $(this).parent().index();
        var col = $(this).index();
        console.log("here");
        setupAutocomplete(findClasses(row, col));
    });

    function findClasses(row, col) {
        if (row !== -1 && col !== -1) {
            var validClasses = $.grep(classList, function(roster){
                //col-1 because the editable text area starts at index 1, but the availabilities array starts at 0
                return (roster.availabilities.length === 0 || (roster.availabilities[row][col-1] !== false));
            });
        }
        return validClasses;
    };

    function updateClasses(newClassList) {
        classList = newClassList;
        setupAutocomplete(classList);
    }

    function saveSchedule(cell, deleteClass) {
        //if we do not have a current participant do not save anything
        if (!currentParticipant) {
            $(".clearable").html("");
            return;
        }
        var col = cell.parent().children().index(cell);
        var row = cell.parent().parent().children().index(cell.parent());
        var participantId = currentParticipant.id;
        var tableRows = $("#schedule").find('tbody').find('tr');
        var time = $(tableRows[row]).find('td:eq(0)').html();
        time = time.split("-");
        time[0] = time[0].trim();
        time[1] = time[1].trim();
        if (classEntered === undefined && (!deleteClass)) {
            $('.addClassWarning').slideDown();
            return;
        }
        if (deleteClass) {
            var classToDelete = savedSchedule[row + "" + col];
            if (classToDelete) {
                var classEvent = {day: col - 1, startTime: time[0], endTime: time[1], classrosterid: classToDelete.id};
                emitter.deleteClass(participantId, classEvent);
            }
        } else {
            var classEvent = {day: col - 1, startTime: time[0], endTime: time[1], classrosterid: classEntered.id};
            emitter.saveClass(participantId, classEvent);
            enteredClassLocation = {row: row, col: col};
        }
        classEntered = undefined;
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

    function updateSchedule(schedule) {
        var tableRows = $("#schedule").find('tbody').find('tr');
        $('.clearable').html("");
        for (var i = 1; i < MAX_COLUMNS + 1; i++) {
            var day = getNumberFromDay($('th:eq(' + i + ')').html().toLowerCase());
            for (var j = 0; j < MAX_ROWS; j++) {
                var time = $(tableRows[j]).find('td:eq(0)').html();
                time = time.split("-");
                time[0] = time[0].trim();
                time[1] = time[1].trim();
                for (var k = 0; k < schedule.length; k++) {
                    var event = schedule[k];
                    if (event.startTime === time[0] && event.day === day) {
                        $(tableRows[j]).find('td:eq(' + i + ')').html(event.classModel.showableString());
                        savedSchedule[j + "" + i] = event;
                    }
                }
            }
        }
    }

    function error() {
        var tableRows = $("#schedule").find('tbody').find('tr');
        var row = enteredClassLocation.row;
        var col = enteredClassLocation.col;
        var beforeClass = savedSchedule[row + "" + col];
        var showableString = "";
        if (beforeClass) {
            showableString = beforeClass.classModel.showableString();
        }
        $(tableRows[row]).find('td:eq(' + col + ')').html(showableString);
    }

    function setCurrentParticipant(participant) {
        currentParticipant = participant;
        $(".clearable").html("");
    }

    function setSettings(days, times, maxRow, maxCol) {
        MAX_ROWS = maxRow;
        MAX_COLUMNS = maxCol;
        var table = $("#schedule");
        var footer = $("tfoot");
        table.html("");
        table.append("<thead><tr></tr></thead>");
        var header = $("thead tr");
        header.append("<th>Time</th>");
        for (var i = 0; i < days.length; i++) {
            var currentDay = days[i];
            header.append("<th>" + currentDay + "</th>")
        }
        table.append("<tbody></tbody>");
        var body = $("tbody");
        for (var i = 0; i < times.length; i++) {
            body.append("<tr></tr>");
            var row = $("table tr:last");
            var currentTime = times[i];
            row.append("<td class='times'>" + currentTime + "</td>");
            for (var j = 0; j < days.length; j++) {
                row.append("<td class='clearable'></td>");
            }
        }
        table.append(footer);
        setupTable();
    }
    
    function changeSettings(newValue, row) {
        var tableRows = $("#schedule").find('tbody').find('tr');
        if (!newValue.trim()) {
            emitter.removeTime(row);
        } else if (row >= MAX_ROWS) {
            var time = $(tableRows[row]).find('td:eq(0)').html();
            var times = time.split("-");
            times[0] = times[0].trim();
            times[1] = times[1].trim();
            emitter.addTime(times[0], times[1]);
        }
        var startTimes =[], endTimes = [], days;
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        for (var i = 0; i < MAX_ROWS; i++) {
            var time = $(tableRows[i]).find('td:eq(0)').html();
            var times = time.split("-");
            times[0] = times[0].trim();
            times[1] = times[1].trim();
            startTimes.push(times[0]);
            endTimes.push(times[1]);
        }
        emitter.updateSettings(days, startTimes, endTimes);
    }

    return {
        init: init,
        updateSchedule: updateSchedule,
        updateClasses: updateClasses,
        setCurrentParticipant: setCurrentParticipant,
        error: error,
        setSettings: setSettings
    };

})();