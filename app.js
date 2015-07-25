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

// function seedDb(){
// 	var counter = 0
// 	lineReader.eachLine('dictionary.txt', function(line) {
// 		users.insert({ "word": line });
// 		console.log('Word ' + counter + ' added!');
// 		counter += 1;
// 	});
// };

function Board() {
	this.board = this.createBoard();
};

Board.prototype.createBoard = function(){
	var grid = [];
	var final_grid = [];
	var letters = ['A','B','C','D','E','F','G','H','I','J','K',
				'L','M','N','O','P','Q','R','S','T','U','V','W','X',
				'Y','Z'];
	for (i=0; i<255; i++){
		var rand = Math.floor(Math.random() * letters.length);
		grid.push(letters[rand]);
	};
	for (i=1; i<16; i++){
		var entry = grid.slice(i*15,(i*15)+15);
		var entry = entry.join('');
		final_grid.push(entry);
	};
	return final_grid;
};

Board.prototype.parseThrough = function() {
	var yo = this;
	users.find({}, function (err, docs){
		if (err){
			return 'error';
		}
		else{
			for (i = 0; i < docs.length; i++){
				yo.findWords(docs[i].word);
			}
		};
	});
};

Board.prototype.findWords = function(word) {
	null
};

yo = new Board;
