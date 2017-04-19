var Participant = function (name, id) {
	this.name = name
	this.id = id;
}

Participant.prototype.titleString = function () {
	return this.name;
};

Participant.prototype.equal = function (other) {
	if (other === undefined) {
		return false;
	}
	return this.name === other.name;
};