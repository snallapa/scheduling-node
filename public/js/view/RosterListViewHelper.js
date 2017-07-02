var RosterListViewHelper = (function () {
    var classList = [];
    var currentSpot;
    var emitter;
    var listObservers;

    function init(initEmitter) {
        emitter = initEmitter;
        currentSpot = new CurrentSpot(0, undefined, 0);
        emitter.getClassesForDay(0);
        listObservers = [];
        bind();
    }

    function setupFirstIndex() {
        currentSpot = new CurrentSpot(0, undefined, 0);
    }

    function setList(newClasses) {
        classList = newClasses;
    }

    function getList() {
        return classList;
    }

    function CurrentSpot(index, currentClass, day) {
        this.index = index;
        this.currentClass = currentClass;
        this.day = day;
    }

    function updateIndex(index) {
        if (index == -1) {
            currentSpot.index = -1;
            currentSpot.currentClass = undefined;
            $(".classTitle").html("");
            listObservers.forEach(notify);
        } else {
            currentSpot.index = index;
            currentSpot.currentClass = classList[index];
            $(".classTitle").html(currentSpot.currentClass.showableString());
            emitter.getParticipantsInClass(currentSpot.day,
                currentSpot.currentClass.startTime,
                currentSpot.currentClass.classModel.id);
            listObservers.forEach(notify);
        }
    }

    function bind() {
        $(document).keypress(documentEnter);
        $(".tabs a").click(changeDay);
        $(".addClassButton").click(addClass);
        $(".deleteRoster").click(removeRoster);
        $('#addClassModal').on('shown.bs.modal', function () {
            $('#name').focus();
        });
    }

    function clearSearch() {
        $("#search").val("");
    }

    function documentEnter(e) {
        if (e.which == 13) {
            e.preventDefault();
            if (($("#addClassModal").data('bs.modal') || {}).isShown) {
                $(".addClassButton").trigger("click");
            }
        }
    }

    function changeDay(event) {
        event.preventDefault();
        $("tbody").html("");
        $(".classTitle").html("");
        $(this).tab('show');
        var dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday"];
        currentDay = dayNames.indexOf($(event.target).text().toLowerCase());
        currentSpot.day = currentDay;
        emitter.getClassesForDay(currentDay);
    }

    function addClass() {
        var name = $("#name").val().trim();
        var location = $("#location").val().trim();
        var max = $("#max").val().trim();
        if (name === "" || (max != '' && isNaN(parseInt(max)))) {
            $(".classNotAdded").slideDown().delay(3000)
                .slideUp();
        } else {
            max = parseInt(max);
            $("#name").val("");
            $("#location").val("");
            $("#max").val("");
            $('#addClassModal').modal('hide');
            clearSearch();
            $('.addClassWarning').slideUp();
            emitter.newClass(name, location, max)
        }
    }

    function addObserver(observer) {
        listObservers.push(observer);
    }

    function notify(observer) {
        observer.classChange(currentSpot.currentClass);
    }

    function onRemoveClicked(event) {
        event.stopImmediatePropagation();
        $(".deleteRosterWarning").slideDown();
    }

    function removeRoster() {
        clearSearch();
        $(".deleteRosterWarning").slideUp();
        emitter.deleteRoster(currentSpot.day,
            currentSpot.currentClass.startTime,
            currentSpot.currentClass.endTime,
            currentSpot.currentClass.classModel.id);
    }

    function getCurrentListItem() {
        return currentSpot.currentClass;
    }

    function getCurrentIndex() {
        return currentSpot.index;
    }

    function getRemoveTitle() {
        return "Remove class";
    }

    return {
        init: init,
        setupFirstIndex: setupFirstIndex,
        setList: setList,
        updateIndex: updateIndex,
        onRemoveClicked: onRemoveClicked,
        addObserver: addObserver,
        getList: getList,
        getCurrentListItem: getCurrentListItem,
        getCurrentIndex: getCurrentIndex,
        getRemoveTitle: getRemoveTitle
    }

})();



