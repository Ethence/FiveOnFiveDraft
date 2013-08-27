var fs = require('fs');
var path = require('path');

exports.sendjson = function (req, res) {
	var f = path.resolve(__dirname, '../public/data/members.json'); 
	fs.readFile(f, {encoding: 'utf8'}, function (err, data) {
		if(err) throw err;
		//console.log(data);
		res.send(data);
	});
};
