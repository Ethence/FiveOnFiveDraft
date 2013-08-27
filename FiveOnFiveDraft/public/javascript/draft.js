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
	for (var m in allMembers) {
		if (allMembers[m]) this._groupedMembers[m] = allMembers[m];
		else this._unGroupedMemList.push(m);
	}
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
	this._triggerElem.onclick = function () {
		if (self._unGroupedMemList.length > 0) {
			if (self._memIndex < 0) {
				rid = self.setMemberRotation();
				//set the keyboard event
			}
			else {
				if (rid) clearInterval(rid);
				//clear the keyboard event
				//select the member
				alert(self._unGroupedMemList[self._memIndex]);
				self._memIndex = -1;
			}
		}
		else {
			alert("All members found their slots!");
		}
	};
};


var disElem = document.getElementById("toPick");
var triggerElem = document.getElementById("getLuck");
var ffd = new Draft(disElem, triggerElem); //five five draft
ffd.fetchMembers('/members');
ffd.init();
ffd._disElem.innerHTML = ffd._unGroupedMemList[0];
//alert(ffd._disElem.innerHTML);