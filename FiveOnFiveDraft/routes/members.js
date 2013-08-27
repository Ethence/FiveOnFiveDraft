var fs = require('fs');
var path = require('path');
var url = require('url');

exports.sendjson = function (req, res) {
	var f = path.resolve(__dirname, '../public/data/members.json'); 
	fs.readFile(f, {encoding: 'utf8'}, function (err, data) {
		if(err) throw err;
		//console.log(data);
		res.send(data);
	});
};

exports.updateMembers = function (req, res) {
	var f = path.resolve(__dirname, '../public/data/members.json'); 
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