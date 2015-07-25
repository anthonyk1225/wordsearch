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
	for (var i=0; i<255; i++){
		var rand = Math.floor(Math.random() * letters.length);
		grid.push(letters[rand]);
	};
	for (var i=1; i<16; i++){
		var entry = grid.slice(i*15,(i*15)+15);
		var entry = entry.join('');
		final_grid.push(entry);
	};
	return final_grid;
};

Board.prototype.parseThrough = function() {
	foundWords = []
	var yo = this;
	users.find({}, function (err, docs){
		if (err){
			return 'error';
		}
		else{
			for (var i = 0; i < docs.length; i++){
				if (docs[i].word.length > 2){
					a = yo.findWords(docs[i].word) ;
					if (a != undefined){
						foundWords.push(a)
					}
				}	
			}
		};
	});
};

Board.prototype.findWords = function(word) {
	var yo = this;
	for (var i = 0; i < yo.board.length; i ++) {
		for (var j = 0; j < yo.board[i].length; j++) {
			if (yo.board[i][j] == word[0]) {
				if (j + word.length <= 15){
					if (yo.board[i].slice(j, (j + word.length)) == word.toUpperCase()) {
						return word
					};
				};
				if (i + word.length <= 15) {
					hit = ''
					for (var k = i; k < i + word.length; k ++) {
						hit += this.board[k][j];
					};
					if (hit == word.toUpperCase()){
						return word
					};
				};
				if (i + word.length <= 15 && j + word.length <= 15){
					hit = ''
					for (var z = 0; z < word.length; z ++) {
						hit += this.board[i + z][j + z];
					};
					if (hit == word.toUpperCase()){
						return word
					};
				};
			};
		};
	};
};

app.get('/', function(req, res) {
	res.render('index');
});

app.get(/\/newgame\/[0-9]+/, function(req, res) {
	var yo = new Board
	res.render('game', {board: yo.board});
});

yo = new Board
yo.parseThrough()
console.log(yo.board)
