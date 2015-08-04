var express = require("express");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
require('./sockets')(io);

http.listen(3000, function(){
  console.log('listening on *:3000');
});
 
var db = require('monk')('localhost/test');
var users = db.get('words');
var game = require('monk')('localhost/games');
var currentgames = game.get('currentgames');
var board = require('monk')('localhost/boards')
var table = board.get('tables');

module.exports = db;
var lineReader = require('line-reader');

app.set('view engine', 'ejs');
app.use(express.static('public'));

/////// Use this to seed Db //////
// function seedDb(){
// 	var counter = 0
// 	lineReader.eachLine('dictionary.txt', function(line) {
// 		users.insert({ "word": line });
// 		console.log('Word ' + counter + ' added!');
// 		counter += 1;
// 	});
// };

// Board class & cooresponding prototypes //////
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

Board.prototype.parseThrough = function( callback ) {
	var yo = this;
	var combos = []
	users.find({}, function (err, docs){
		if (err){
			return 'error';
		}
		else{
			for (var i = 0; i < docs.length; i++){
				if (docs[i].word.length > 2){
					a = yo.findWords(docs[i].word) ;
					if (a != undefined){
						combos.push(a.toLowerCase())
					}
				}	
			}
			callback (combos)
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

////////////Paths/////////////////
app.get('/', function(req, res) {
	res.render('index');
});

app.get(/\/newgame\/([0-9]+)\/([2-5]{1})/, function(req, res) {
	var gameid = (req.params['0'] + req.params['1'])
	currentgames.find({'gameid' : gameid}, function (err, doc){
		if (err){
			return 'error';
		}
		else {
			var result = doc
			if (result.length == 0){
				currentgames.insert({'gameid' : gameid})
				var yo = new Board
				yo.parseThrough(function(combos){
					table.insert({encasing : {'gameid' : gameid, 'board' : yo.board, 'combos': combos}})
					res.render('game', {board: yo.board, 'combos': combos});
				});
			}
			else {
				table.find({'encasing.gameid' : gameid}, function (err, documents){
					if (err){
						return 'error';
					}
					else {
						res.render('game', {'board': documents[0].encasing.board, 'combos': documents[0].encasing.combos})
					}
				});
			};
		};
	});
}); 
