var TableView = (function () {
    var participantEntered;
    var savedParticipants;
    var allParticipantsList;
    var emitter;
    var currentClass;
    var enteredRosterLocation;

    function init(initEmitter) {
        emitter = initEmitter;
        savedParticipants = {};
        allParticipantsList = [];
        bind();
        setupTable();
    }

    function bind() {
        $(".addParticipant").click(addParticipant);
        $(".addRow").click(addRow);
        $(".exportSchedule").click(exportRoster);
    }

    function addParticipant() {
        $('.addParticipantWarning').slideUp();
    }

    function addRow() {
        $("tbody").append("<tr><td class = 'names'><td class ='names'></td></tr>");
        setupTable();
    }

    function exportRoster() {
        if (!currentClass) {
            return;
        }
        var exportWindow = window.open("exportrosters", "exportrosters", '');
        exportWindow.onload = function () {
        };
    }

    function updateParticipants(participants) {
        $("tbody").html("");
        var row = 0;
        var col = 0;
        for (var i = 0; i < participants.length; i++) {
            $("tbody").append("<tr></tr>");
            $("tbody tr").last().append('<td class="names">' + participants[i].name + '</td>');
            savedParticipants[row + "" + col] = participants[i];
            if (i === participants.length - 1) {
                break;
            }
            col++;
            i++;
            $("tbody tr").last().append('<td class="names">' + participants[i].name + '</td>');
            savedParticipants[row + "" + col] = participants[i];
            row++;
            col--;
        }
        if (participants.length % 2 == 1) {
            $("tbody tr").last().append('<td class="names"></td>');
        }

        setupTable();
    }

    function validate(evt, newValue) {
        if (newValue.trim().length > 65) {
            participantEntered = undefined;
            return false;
        }
        return true;
    }

    function change(evt, newValue) {
        saveRosters($(this), (newValue.trim() === ""));
    }

    function setupAutocomplete(participants) {
        $("textarea").not("#search").autocomplete({
            source: participants.map(function (participant) {
                return {value: participant.name, label: participant.name, actualParticipant: participant};
            })
        });
        $("textarea").not("#search").on("autocompleteselect", onItemSelected);
        $("textarea").not("#search").on("autocompletefocus", onItemSelected);
    }

    function setupTable() {
        $('#rosters').editableTableWidget({
            editor: $('<textarea>')
        });

        $('#rosters').editableTableWidget({
            cloneProperties: ['background', 'border', 'outline']
        });

        $('table td').on('validate', validate);

        $('table td').on('change', change);
        setupAutocomplete(allParticipantsList);
    }

    function onItemSelected(event, ui) {
        participantEntered = ui.item.actualParticipant;
    }

    function saveRosters(cell, deleteRoster) {
        //if we do not have a class do not do anything
        if (!currentClass) {
            $("tbody").html("");
            return;
        }
        var col = cell.parent().children().index(cell);
        var row = cell.parent().parent().children().index(cell.parent());

        if (participantEntered === undefined && (!deleteRoster)) {
            $('.addParticipantWarning').slideDown();
            return;
        }

        if (deleteRoster) {
            var deleteParticipant = savedParticipants[row + "" + col];
            emitter.deleteParticipantFromRoster(deleteParticipant.id, currentClass.day, currentClass.startTime, currentClass.endTime, currentClass.classModel.id);

        } else {
            emitter.saveRoster(participantEntered.id, currentClass.day, currentClass.startTime, currentClass.endTime, currentClass.classModel.id);
            enteredRosterLocation = {row: row, col: col};
        }
        participantEntered = undefined;
    }

    function setCurrentClass(newClass) {
        currentClass = newClass;
        $("tbody").html("");
    }


    function updateAllParticipants(newAllParticipants) {
        allParticipantsList = newAllParticipants;
        setupAutocomplete(allParticipantsList);
    }

    function error() {
        if (!enteredRosterLocation) {
            return;
        }
        var row = enteredRosterLocation.row;
        var col = enteredRosterLocation.col;
        var beforeParticipant = savedParticipants[row + "" + col];
        var showableString = "";
        if (beforeParticipant) {
            showableString = beforeParticipant.name;
        }
        var tableRows = $("#rosters").find('tbody').find('tr');
        $(tableRows[row]).find('td:eq(' + col + ')').html(showableString);
    }

    return {
        init: init,
        updateParticipants: updateParticipants,
        updateAllParticipants: updateAllParticipants,
        setCurrentClass: setCurrentClass,
        error: error
    }

})();