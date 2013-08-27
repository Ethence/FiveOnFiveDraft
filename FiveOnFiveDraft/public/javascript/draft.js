var Constants = {
		NUM_SLOTS_PER_GROUP : 6,
		GROUP_LABEL_BASE : 'A',
		EMPTY_MEMBER : '----'
};

function Draft(disElem, triggerElem) {
	this._disElem = disElem;
	this._triggerElem = triggerElem;
	this._groupedMembers = {};
	this._unGroupedMemList = [];
	this._memIndex = -1;
}


Draft.prototype.fetchMembers = function (url) {
	//same host
	var xhr = new XMLHttpRequest();
	xhr.open("get", url, false);
	xhr.send(null);
	var allMembers = {};
	if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
		allMembers = JSON.parse(xhr.responseText);
	}
	//else //what?
	for (var m in allMembers) {
		if (allMembers[m]) this._groupedMembers[m] = allMembers[m];
		else this._unGroupedMemList.push(m);
	}
};

Draft.prototype.addGroupedMemberOnServer = function (url, m, g) {
	var xhr = new XMLHttpRequest();
	var options = {};
	options[m] = g;
	xhr.open("get", Draft.utils.addUrlParameters(url, options), false);
	xhr.send(null);
	if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
		//maybe here I should add grouped member locally
	}
	else {
		alert("Server not syncronized. Better refresh to redraw the last position.");
	}
};

Draft.prototype.getSlotName = function () {
	return this._triggerElem.value;
};

Draft.prototype.setSlotName = function (name) {
	this._triggerElem.value = name;
};

Draft.prototype.updateSlotName = function () {
	this._triggerElem.value = Draft.utils.numToSlotName(this.getNumOfGroupedMembers()+1);
};

Draft.prototype.displayEmptyMember = function () {
	this._disElem.innerHTML = Constants.EMPTY_MEMBER;
};

Draft.prototype.getNumOfGroupedMembers = function () {
	return Object.keys(this._groupedMembers).length;
};

Draft.prototype.addGroupedMember = function (m, g) {
	this._groupedMembers[m] = g;
};

Draft.prototype.setMemberRotation = function () {
	var self = this;
	var rotateHandler = setInterval(function() {
		self._memIndex ++;
		self._memIndex = self._memIndex % self._unGroupedMemList.length;
		self._disElem.innerHTML = self._unGroupedMemList[self._memIndex];		
	}, 50);
	return rotateHandler;
};

Draft.prototype.setMemberSelection = function (rotateHandler) {
	
};


Draft.prototype.init = function () {
	var self = this;
	var rid = null;
	this.updateSlotName();
	this._triggerElem.onclick = function () {
		if (self._unGroupedMemList.length > 0) {
			if (self._memIndex < 0) {
				rid = self.setMemberRotation();
				//set the keyboard event. to do later
			}
			else {
				if (rid) clearInterval(rid);
				//clear the keyboard event. to do later
				//select the member
				var selMem = self._unGroupedMemList.splice(self._memIndex, 1);
				self.addGroupedMember(selMem, self.getSlotName());
				self.addGroupedMemberOnServer("update_members", selMem, self.getSlotName());
				alert(selMem + ": " + self.getSlotName());
				self._memIndex = -1;
				self.updateSlotName();
				self.displayEmptyMember();
			}
		}
		else {
			alert("All members found their slots!");
			self.displayEmptyMember();
		}
	};
};

Draft.utils = {};

Draft.utils.numToSlotName = function (n) { //n is assumed to start from 1
	var groupNum = Math.floor((n-1) / Constants.NUM_SLOTS_PER_GROUP);
	var ingroupNum = (n-1) % Constants.NUM_SLOTS_PER_GROUP + 1;
	var group = String.fromCharCode(groupNum + Constants.GROUP_LABEL_BASE.charCodeAt(0));
	return group+ingroupNum;
};

Draft.utils.addUrlParameters = function (url, options) {
	var newUrl = url;
	var ps = Object.keys(options);
	for (var i = 0; i < ps.length; i++) {
        if (newUrl.indexOf("?") === -1) newUrl += "?";
        else newUrl += "&";
        newUrl += (ps[i] + "=" + options[ps[i]]);
	}
	return newUrl;
};


var disElem = document.getElementById("toPick");
var triggerElem = document.getElementById("getLuck");
var ffd = new Draft(disElem, triggerElem); //five five draft
ffd.fetchMembers('/members');
ffd.init();
//ffd._disElem.innerHTML = ffd._unGroupedMemList[0];
//alert(ffd._disElem.innerHTML);