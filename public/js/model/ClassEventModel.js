var ClassEvent = function(day, startTime, endTime, classModel, id, numberInClass) {
	this.day = day;
	this.startTime = startTime;
	this.endTime = endTime;
	this.classModel = classModel;
	this.id = id;
	this.numberInClass = numberInClass;
}

ClassEvent.prototype = {
	showableString: function () {
		var dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
		var classTime = this.startTime + "-" + this.endTime;
		var maxNumber = this.classModel.max;
		if (!maxNumber) {
			maxNumber = "&infin;";
		}
		maxNumber = this.numberInClass + "/" + maxNumber;
		if (this.classModel.max && this.numberInClass >= this.classModel.max) {
			maxNumber = "<font color='red'>" + maxNumber + "</font>"
		}
		var location = this.classModel.location;
		if (!location) {
			location = "No location";
		}
		return this.classModel.name 
		+ " - " 
		+ location
		+ " - " + dayNames[this.day] 
		+ " " + classTime 
		+ " : " 
		+ maxNumber
	},
	titleString: function() {
		if (this.classModel.location) {
			return this.classModel.titleString() + " - " + this.classModel.location;
		} else {
			return this.classModel.titleString();
		}
		
	},
	subtitleString: function() {
		return this.startTime + "-" + this.endTime;
	},
	equal: function(other) {
		return this.day === other.day
		&& this.startTime === other.startTime
		&& this.endTime === other.endTime
		&& this.classModel.equal(other.classModel);
	}
};