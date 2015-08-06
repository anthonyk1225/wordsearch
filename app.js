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
var board = require('monk')('localhost/boards');
var table = board.get('tables');
var data = require('monk')('localhost/gamestate');
var gamestate = data.get('data');

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

/////// for gamestate of app //////
function Players(){
	this.currentPlayer = 1;
	this.playerScores = {};
};

Players.prototype.nextPlayer = function( totalPlayers ) {
	if (this.currentPlayer != totalPlayers) {
		this.currentPlayer += 1;
	}
	else {
		this.currentPlayer = 1;
	};
};

Players.prototype.addScore = function( player ) {
	this.playerScores[player] += 1;
};

Players.prototype.gameOver = function( answers ) {
	if (answers.length == 0){
		return true
	};
	return false
};

Players.prototype.winner = function ( players ){
	var winnerScore = { 'player' : 0 } // a object with the top player's score
	var winner = '' // the player who is high score
	for (i = 1; i <= players; i++){ //for index in list of all the players
		if (this.playerScores[i] > winnerScore.player){ 
			winnerScore.player = this.playerScores[i];
			winner = i
		};
	};
	return winner	
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
					gamestate.insert({ 'gamestate' : {  'gameid': gameid, 'current_player' : {},
					 'scores' : {} ,'guessed_ansers' : [], 'players' : {} }})
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

app.get('/playerassignment/', function(req, res) { // takes a player and enters them into the game
	var gameid = req.query.gameid;
	var username = req.query.username;
	var playerMax = req.query.players;
	gamestate.find({'gamestate.gameid' : gameid}, function (err, docs) {
		if (err){
			return 'error';
		}
		else {
			var players = docs[0].gamestate.players;
			var keys = Object.keys(players).sort();
			var nextEntry = keys.length;
			if (nextEntry == playerMax){
				res.json({'full': 'Sorry, this game is full!'})
			}
			else {
				players[nextEntry] = username;
				gamestate.findAndModify({"gamestate.gameid" : gameid},{$set:{"gamestate.players" : players}});
				if ( nextEntry == 0) {
					gamestate.findAndModify({"gamestate.gameid" : gameid},
						{$set:{"gamestate.current_player" : {'username': username, 'number' : nextEntry}}});	
				};
				res.json({'yourNumber' : nextEntry});
			};
		};
	});
});

app.get('/currentplayer/', function(req, res) {
	var gameid = req.query.gameid;
	gamestate.find({'gamestate.gameid' : gameid}, function (err, docs) {
		if (err) {
			return 'error';
		}
		else {
			res.json(docs[0].gamestate.current_player)
		};
	});
});







