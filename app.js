var express = require("express");
var app = express();
var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});

var db = require('monk')('localhost/test');
var users = db.get('words');
module.exports = db;
var lineReader = require('line-reader');
// var io = require('socket.io').listen(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function(req, res) {
	res.render('index');
});

app.get(/\/newgame\/[0-9]+/, function(req, res) {
	res.render('game');
});

function findWords(){
	var combinations = [];
	users.find({}, function(err, docs){
		if (err){ console.log("error") }
		for (index in docs){
			if (docs[index].word.length > 3){
				combinations.push({'word': docs[index].word});
				if (combinations.length == 1000){
					return combinations
				};
			};
		};
	});
};

function seedDb(){
	var counter = 0
	lineReader.eachLine('dictionary.txt', function(line) {
		users.insert({ "word": line });
		console.log('Word ' + counter + ' added!');
		counter += 1;
	});
};

// io.sockets.on('connection', function(socket){
// 	socket.on('send message', function(data){
// 		io.sockets.emit('new message', data);
// 	});
// });

// seedDb()