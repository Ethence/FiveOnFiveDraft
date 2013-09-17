var fs = require('fs');
var path = require('path');
var url = require('url');
var f = path.resolve(__dirname, '../public/data/members.json'); 
//var f = path.resolve(__dirname, '../public/data/testMembers2.json'); 

exports.sendjson = function (req, res) {
	fs.readFile(f, {encoding: 'utf8'}, function (err, data) {
		if(err) throw err;
		res.send(data);
	});
};

exports.updateMembers = function (req, res) {
	var queries = url.parse(req.url, true).query;
	fs.readFile(f, {encoding: 'utf8'}, function (err, data) {
		if (err) throw err;
		var members = JSON.parse(data);
		var properties = Object.keys(queries);
		for (var i = 0; i < properties.length; i++) {
			var p = properties[i];
			members[p] = queries[p];
		}
		fs.writeFile(f, JSON.stringify(members), function (){});
	});
	res.send(queries);
};

exports.clearDraft = function (req, res) { 
	fs.readFile(f, {encoding: 'utf8'}, function (err, data) {
		if (err) throw err;
		var all = JSON.parse(data);
		var members = Object.keys(all);
		for (var i = 0; i < members.length; i++) {
			all[members[i]] = null;
		}
		fs.writeFile(f, JSON.stringify(all), function (){});
	});
	var htmlStr = "<h4>reset successful!</h4><br />";
	htmlStr += "<a href=\"/show_members\">show</a>";
	res.send(htmlStr);
};

exports.showMembers = function (req, res) {
	fs.readFile(f, {encoding: 'utf8'}, function (err, data) {
		if (err) throw err;
		var all = JSON.parse(data);
		var members = Object.keys(all);
		members.sort(function (a,b){
			if (!all[a] && all[b]) return 1;
			else if (!all[a] && !all[b]) {
				if (a < b) return -1;
				else if (a == b) return 0;
				else return 1;
			}
			else if (all[a] && !all[b]) return -1;
			else if (all[a] < all[b]) return -1;
			else if (all[a] == all[b]) return 0;
			else return 1;
		});
		var headStr = "<head><title>Five and Five Members</title></head>";
		var bodyStr = "<table>";
		bodyStr += "<tr><th>Name</th><th>Slot</th></tr>";
		for (var i = 0; i < members.length; i++) {
			var temp = all[members[i]];
			if (!temp ) temp = "N/A";
			bodyStr += ("<tr><td>"+members[i] + "</td><td>&nbsp;&nbsp;" + temp + "</td></tr>");
		}
		bodyStr += "</table>";
		bodyStr += "<br />";
		bodyStr += "<a href=\"/clear_draft\">reset</a>";
		bodyStr += "&nbsp;&nbsp;";
		bodyStr += "<a href=\"/\">draw</a>";
		res.send(headStr+bodyStr);
	});
};