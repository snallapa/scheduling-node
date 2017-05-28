var ClassModel = function (name, location, max, id) {
	this.name = name;
	this.location = location;
	this.max = max;
	this.id = id;
};

ClassModel.prototype = {
	showableString: function () {
		if (location) {
			return this.name + "\n" + this.location;
		} else {
			return this.name;
		}

	},
	equal : function(otherClass) {
		return this.name === otherClass.name 
		&& this.location === otherClass.location
		&& this.max === otherClass.max;
	},
	titleString: function() {
		return this.name;
	},
	subtitleString: function() {
		return this.startTime + ' - ' + this.endTime;
	}
};