var userclasses;
var index;

// a devil file that has not been refactored but this page is so simple it works
$(document).ready(function () {
    $(".alert").hide();
    $(".alert").slideUp();

    socket = io();

    //for any error messages server sends us
    socket.on("errorMessage", function (error) {
        alert(error);
    });

    //the class list
    socket.on('classlist', function (classes) {
        userclasses = classes;
        loadClasses(userclasses);
    })

    //show warning when the remove is clicked
    $("div").on('click', ".glyphicon-remove", function (event) {
        index = $('#classes tr').index($(event.target).parent().parent()) - 1;
        event.stopImmediatePropagation();
        $(".deleteAlert").slideDown();
    });

    //show modal when the edit class is clicked
    $("div").on('click', ".glyphicon-pencil", function (event) {
        index = $('#classes tr').index($(event.target).parent().parent()) - 1;
        event.stopImmediatePropagation();
        $('#editClassModal').modal();
    });

    //fill the modal with the relevant information
    $('#editClassModal').on('shown.bs.modal', function () {
        $('#editNewName').focus();
        var className = $('#classes tr').eq(index + 1).find('td').eq(0).text();
        var locationName= $('#classes tr').eq(index + 1).find('td').eq(1).text();
        $("#editNewName").val(className);
        $("#editLocation").val(locationName);
        $("#editMax").val($('#classes tr').eq(index + 1).find('td').eq(2).text());

        for (var i = 0; i < userclasses.length; i++) {
            if (userclasses[i].nameLower === className.toLowerCase()
                && userclasses[i].locationLower == locationName.toLowerCase()) {
                var available = userclasses[i].availabilities;
            }
        }
        addUnavailabilities(available, '.new-time .new-schedule');


    });

    //send message to server when we want to save
    $(".editClassButton").click(function () {
        var newName = $("#editNewName").val();
        var newLocation = $("#editLocation").val();
        var newMax = $("#editMax").val();
        var newAvailability = getAvailabilities('.new-time .new-schedule');
        if (newName === "") {
            $(".classNotEdited").slideDown().delay(3000)
                .slideUp();
        }
        else {
            var name = $('#classes tr').eq(index + 1).find('td').eq(0).text();
            var location = $('#classes tr').eq(index + 1).find('td').eq(1).text();
            var max = $('#classes tr').eq(index + 1).find('td').eq(2).text();
            for (var i = 0; i < userclasses.length; i++) {
                if (userclasses[i].nameLower === name.toLowerCase()
                    && userclasses[i].locationLower === location.toLowerCase()
                    && userclasses[i].maxNumber === max) {
                    index = i;
                    break;
                }
            }
            socket.emit('edit class', {
                id: userclasses[index]._id,
                newName: newName,
                newLocation: newLocation,
                newMax: newMax,
                newAvailability: newAvailability
            });
            $("#editNewName").val("");
            $("#editLocation").val("");
            $("#editMax").val("");
            $('#editClassModal').modal('hide');
            $("#search").val("");
            clearButtons('.edit-button');

        }
    });

    //add focus on the first field
    $('#addClassModal').on('shown.bs.modal', function () {
        $('#name').focus();
    });

    //account for enter button
    $(document).keypress(function (e) {
        if (e.which == 13) {
            e.preventDefault();
            if (($("#addClassModal").data('bs.modal') || {}).isShown) {
                $(".addClassButton").trigger("click");
            } else if (($("#editClassModal").data('bs.modal') || {}).isShown) {
                $(".editClassButton").trigger("click");
            }
        }
    });

    //create a new class
    $(".addClassButton").click(function () {
        var availabilities = getAvailabilities('.time .schedule');
        var name = $("#name").val().trim();
        var location = $("#location").val().trim();
        var max = $("#max").val().trim();
        var numMax = parseInt(max)
        if (name === "" || (max != '' && isNaN(numMax)) || numMax < 0) {
            $(".classNotAdded").slideDown().delay(3000)
                .slideUp();
        } else {
            //max = parseInt(max);
            socket.emit('new class', {name: name, location: location, max: numMax, availabilities: availabilities});
            $("#name").val("");
            $("#location").val("");
            $("#max").val("");
            $('#addClassModal').modal('hide');
            $("#search").val("");
            clearButtons('.add-button');
        }
    });

    //remove the class
    $(".actuallyRemoveClass").click(function () {
        $(".deleteAlert").slideUp();
        socket.emit('remove class', {id: userclasses[index]._id});
        $('#search').val("");
    });

    //slide up the warnings
    $(".closeWarning").click(function () {
        $(".alert").slideUp();
    });

    //search html way
    $('#search').hideseek();

    $(".deleteClassesButton").click(function () {
        $(".deleteAllAlert").slideDown();
    });

    $(".actuallyClearClasses").click(function () {
        socket.emit('clear classes');
        $('#search').val("");
        $(".alert").slideUp();
    });

    $(".deleteScheduledClassesButton").click(function () {
        $(".deleteAllScheduledAlert").slideDown();
    });

    $(".actuallyClearScheduledClasses").click(function () {
        socket.emit('clear scheduled classes');
        $('#search').val("");
        $(".alert").slideUp();
    });
});

//add the classes
function loadClasses(classes) {
    $("#classes").find("tr:gt(0)").remove();
    for (var i = 0; i < classes.length; i++) {
        if (!classes[i].maxNumber) {
            classes[i].maxNumber = "";
        }
        $('#classes> tbody:last-child').append('<tr><td>' + classes[i].name + '</td><td>' + classes[i].location + '</td><td>' + classes[i].maxNumber + '</td><td><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></tr>');
    }

}

// $(".add-button, .edit-button").click(function () {
//     var color = $(this).css('background-color'); //color is a string
//     if (color === 'rgb(255, 255, 255)') { //if color is white or if it's selected as an "unavailable" time
//         $(this).addClass('button-unselect'); //unselect the class so it's an available time
//         $(this).removeClass('button-select');
//     } else {
//         $(this).addClass('button-select');
//         $(this).removeClass('button-unselect');
//     }
//
// });

function getAvailabilities(tableName) {
    var available = []
    $(tableName).each(function () {
        rowIndex = $(this).parent().index();
        if (typeof(available[rowIndex]) === 'undefined') {
            available.push([]);
        }
        // console.log($(this).find('label').hasClass('active'));
        // var c = $(this).find('button').css('background-color');
        if (!$(this).find('label').hasClass('active')) { //button is not selected, meaning that the time is available
            available[rowIndex].push(true);
        } else {
            available[rowIndex].push(false);
        }
    });
    //available is a 2D array that represents the schedule availabilities
    //values inside are either true (available time) or false (unavailable time)
    return available;
}

function addUnavailabilities(arr, tableName) { //assumes arr isn't empty and contains a 2D array
    $(tableName).each(function() {
         row = $(this).parent().index();
         col = $(this).index();

         if (arr[row][col-1] === false) { //col-1 because the editable text area starts at index 1, but the arr starts at 0
             $(this).find('label').addClass('active');
         } else { //** ALSO LOOK INTO THIS there's a delay between when the old buttons disappear and when the appropriate ones show up
             $(this).find('label').removeClass('active');
         }
    })
}

function clearButtons(buttonName) {
    $(buttonName).each(function() {
        $(this).removeClass('active');
    })
}


