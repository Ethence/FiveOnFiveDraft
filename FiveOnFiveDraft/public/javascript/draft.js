var Constants = {
		NUM_SLOTS_PER_GROUP : Infinity,
		GROUP_LABEL_BASE : 'A',
		EMPTY_MEMBER : '--------',
		NSPG_QUERY : 'nspg'
};

function Draft(disElem, triggerElem, msgElem, resultContainer) {
	this._disElem = disElem;
	this._triggerElem = triggerElem;
	this._msgElem = msgElem;
	this._resultContainer = resultContainer;
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

Draft.prototype.confirmLastDraftResult = function (n, g) {
	this._msgElem.innerHTML = "Congratulations! <span class=\"warn-emph\">" + n + "</span> in <span class=\"warn-emph\">" + g + "</span>!";
};

Draft.prototype.warnFull = function () {
	this._msgElem.innerHTML = "Woops! Everybody has been assigned a slot.";
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

Draft.prototype.addDraftResult = function (name, slot) {
	var g = slot.charAt(0);
	var n = slot.slice(1);
	if (n === '1') {
		var gDiv = document.createElement("div");
		gDiv.className = "group-name";
		gDiv.innerHTML = g;
		this._resultContainer.appendChild(gDiv);
	}
	
	var r = document.createElement("div");
	r.className = "result";
	var s1 = document.createElement("span");
	var s2 = document.createElement("span");
	s1.className = "result-sn";
	s2.className = "result-name";
	s1.innerHTML = n;
	s2.innerHTML = name;
	r.appendChild(s1);
	r.appendChild(s2);
	this._resultContainer.appendChild(r);
	this._resultContainer.parentNode.scrollTop = this._resultContainer.parentNode.scrollHeight;
};

Draft.prototype.addCurrentDraftResults = function () {
	var members = Object.keys(this._groupedMembers);
	var gm = this._groupedMembers;
	members.sort(function(a,b){
		if (gm[a] < gm[b]) return -1;
		else if (gm[a] == gm[b]) return 0;
		else return 1;
	});
	for (var i = 0; i < members.length; i++) {
		var n = members[i];
		this.addDraftResult(n, this._groupedMembers[n]);
	}
};

Draft.prototype.init = function () {
	this.fetchMembers('/members');
	this.updateSlotName();
	this.addCurrentDraftResults();
	var self = this;
	var rid = null;
	this._triggerElem.onclick = function () {
		if (self._unGroupedMemList.length > 0) {
			if (self._memIndex < 0) {
				rid = self.setMemberRotation();
			}
			else {
				if (rid) clearInterval(rid);
				var selMem = self._unGroupedMemList.splice(self._memIndex, 1);
				var sn = self.getSlotName();
				self.addGroupedMember(selMem, sn);
				self.addGroupedMemberOnServer("update_members", selMem, sn);
				self.addDraftResult(selMem, sn);
				self.confirmLastDraftResult(selMem, sn);
				self._memIndex = -1;
				self.updateSlotName();
				self.displayEmptyMember();
			}
		}
		else {
			self.warnFull();
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

Draft.utils.getQueryStringArgs = function () {
	//get query string without the initial ?
	var qs = (location.search.length > 0 ? location.search.substring(1) : "");
	//object to hold data
	var args = {};
	//get individual items
	var items = qs.length ? qs.split("&") : [];
	var item = null;
	var name = null;
	var value = null;
	//used in for loop
	var i = 0;
	var len = items.length;
	//assign each item onto the args object
	for (i=0; i < len; i++){
		item = items[i].split("=");
		name = decodeURIComponent(item[0]);
		value = decodeURIComponent(item[1]);
		if (name.length) {
			args[name] = value;
		}
	}
	return args;				
};


Draft.utils.setNSPG = function () {
	var q = Draft.utils.getQueryStringArgs();
	if (q[Constants.NSPG_QUERY]) {
		var k = parseInt(q[Constants.NSPG_QUERY], 10);
		if (k > 0 && k <= 32) Constants.NUM_SLOTS_PER_GROUP = k;
	}
	if (Constants.NUM_SLOTS_PER_GROUP === Infinity) Constants.GROUP_LABEL_BASE = "";
};

/* ================= Main ================== */
Draft.utils.setNSPG();
var disElem = document.getElementById("toPick");
var msgElem = document.querySelector(".left .msg"); 
if (Constants.NUM_SLOTS_PER_GROUP === Infinity) msgElem.innerHTML = "";
else msgElem.innerHTML = "Group Capacity: " + Constants.NUM_SLOTS_PER_GROUP;
var resultContainer = document.getElementById("resultContainer");
var triggerElem = document.getElementById("getLuck");
var ffd = new Draft(disElem, triggerElem, msgElem, resultContainer); //five five draft
ffd.init();
