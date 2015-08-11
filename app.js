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

///// Use this to seed Db //////
// function seedDb(){
// 	var counter = 0
// 	lineReader.eachLine('dictionary.txt', function(line) {
// 		users.insert({ "word": line });
// 		console.log('Word ' + counter + ' added!');
// 		counter += 1;
// 	});
// };

// seedDb();

// Board class & cooresponding prototypes //////
function Board() {
	this.board = this.createBoard();	
};

Board.prototype.createBoard = function(){
	var grid = [];
	var final_grid = [];
	var letters = ['P', 'A', 'C', 'B', 'I','U', 'H','T','N','S','C','D','D','R','E','F', 'O','R','A','I','E','H','T','A','I','E','J','K',
				'T','N','L','A','H', 'F', 'E','M','S', 'T','E','H','O','L','R','I','E','O','E','R','N','A','O','T','P','R', 'S','T', 'U','W','X',
			 'Y','T','N','S','I','N', 'M', 'Z','S','L', 'C', 'R','D','H','O','E','L','T','A','E','N','E','A','I','E','E','O','A','O','T',
			 'I','N','S','G'];
	for (var i=0; i<255; i++){
		var rand = Math.floor(Math.random() * letters.length);
		grid.push(letters[rand]);
	};
	for (var i=1; i<16; i++){
		var entry = grid.slice(i*15,(i*15)+15);
		entry = entry.join('');
		final_grid.push(entry);
	};
	return final_grid;
};

Board.prototype.parseThrough = function( callback ) {
	var yo = this;
	var combos = [];
	users.find({}, function (err, docs){
		if (err) {return 'error'}
		else{
			for (var i = 0; i < docs.length; i++){
				if (docs[i].word.length > 3){
					a = yo.findWords(docs[i].word);
					if (a != undefined){
						if (combos.indexOf(a) == -1){
							combos.push(a.toLowerCase());
						};
					};
				};	
			};
			callback (combos);
		};
	});
};

Board.prototype.findWords = function(word) {
	var yo = this;
	for (var i = 0; i < yo.board.length; i ++) {
		for (var j = 0; j < yo.board[i].length; j++) {
			if (yo.board[i][j] == word[0].toUpperCase()) {
				if (j + word.length <= 15){
					if (yo.board[i].slice(j, (j + word.length)) == word.toUpperCase()) {
						return word;
					};
				};
				if (i + word.length <= 15) {
					var hit = '';
					for (var k = i; k < i + word.length; k ++) {
						hit += this.board[k][j];
					};
					if (hit == word.toUpperCase()){
						return word;
					};
				};
				if (i + word.length <= 15 && j + word.length <= 15){
					var hit = '';
					for (var z = 0; z < word.length; z ++) {
						hit += this.board[i + z][j + z];
					};
					if (hit == word.toUpperCase()){
						return word;
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
	this.combos = null;
};

Players.prototype.nextPlayer = function( player, totalPlayers ) {
	if (player + 1 == totalPlayers ) {
		return 0;
	}
	else {
		return player + 1;
	};
};

Players.prototype.winner = function ( scores, players ){
	var winnerScore = { 'player' : 0}; // a object with the top player's score
	var score = 0;
	for (i = 0; i < players; i++){ //for index in list of all the players
		if (scores[i] > score){ 
			winnerScore.player = i;
			score = scores[i];
		};
	};
	return winnerScore.player;
};

////////////Paths/////////////////
app.get('/', function(req, res) {
	res.render('index');
});

app.get(/\/newgame\/([0-9]+)\/([2-5]{1})/, function(req, res) {
	var gameid = (req.params['0'] + req.params['1']);
	currentgames.find({'gameid' : gameid}, function (err, doc){
		if (err) {return 'error'}
		else {
			var result = doc;
			if (result.length == 0){
				currentgames.insert({'gameid' : gameid});
				var yo = new Board;
				yo.parseThrough(function(combos){
					table.insert({encasing : {'gameid' : gameid, 'board' : yo.board, 'combos': combos}});
					gamestate.insert({ 'gamestate' : {  'gameid': gameid, 'current_player' : {},
					 'scores' : {} ,'guessed_answers' : [], 'players' : {} }});
					res.render('game', {board: yo.board});
				});
			}
			else {
				table.find({'encasing.gameid' : gameid}, function (err, documents){
					if (err) {return 'error'}
					else {
						res.render('game', {'board': documents[0].encasing.board, 'combos': documents[0].encasing.combos});
					};
				});
			};
		};
	});
}); 

app.get('/playerassignment', function(req, res) { // takes a player and enters them into the game
	var gameid = req.query.gameid;
	var username = req.query.username;
	var playerMax = req.query.players;
	var keepWorking = true;
	gamestate.find({'gamestate.gameid' : gameid}, function (err, docs) {
		if (err) {return 'error'}
		else {
			var players = docs[0].gamestate.players;
			var keys = Object.keys(players).sort();
			var nextEntry = keys.length;
			if (keys.length > 0){
				for (i = 0; i < keys.length; i++){
					if (players[i] == username){
						keepWorking = false;
						res.json({'yourNumber' : i, 'guesses' : docs[0].gamestate.guessed_answers});
					};
				};
			};
			if (keepWorking == true){
				if (nextEntry == playerMax){
					res.json({'full': 'Sorry, this game is full!', 'guesses' : docs[0].gamestate.guessed_answers});
				}
				else  {
					players[nextEntry] = username;
					gamestate.findAndModify({"gamestate.gameid" : gameid},{$set:{"gamestate.players" : players}});
					if ( nextEntry == 0) {
						gamestate.findAndModify({"gamestate.gameid" : gameid},
							{$set:{"gamestate.current_player" : {'username': username, 'number' : nextEntry}}});	
					};
					res.json({'yourNumber' : nextEntry, 'guesses' : docs[0].gamestate.guessed_answers});
				};
			};
		};
	});
});

app.get('/findcurrentplayer/', function(req, res) {
	var gameid = req.query.gameid;
	gamestate.find({'gamestate.gameid' : gameid}, function (err, docs) {
		if (err) {return 'error'}
		else {
			res.json(docs[0].gamestate.current_player);
		};
	});
});

app.get('/changecurrentplayer/', function(req, res) {
	var gameid = req.query.gameid;
	var players = req.query.players;
	gamestate.find({'gamestate.gameid' : gameid}, function (err, docs) {
		if (err) {return 'error'}
		else {
			yo = new Players;
			var oldPlayerNumber = docs[0].gamestate.current_player;
			var nextPlayer = yo.nextPlayer(oldPlayerNumber.number, players); //is a integer
			var name = docs[0].gamestate.players[nextPlayer];
			gamestate.findAndModify({"gamestate.gameid" : gameid},
				{$set:{"gamestate.current_player" : {'username': name, 'number' : nextPlayer}}});
			res.json({'username' : name});
		};
	});
});

app.get('/winner', function(req, res) {
	var gameid = req.query.gameid;
	var players = req.query.player;
	gamestate.find({'gamestate.gameid': gameid}, function (err, docs) {
		if (err) { return 'error' }
		else {
			var scores = docs[0].gamestate.scores;
			yo = new Players;
			var winnerNum = yo.winner(scores, players);
			res.json({'winner' : docs[0].gamestate.players[winnerNum]});
		};
	});
});

app.get('/scores/', function(req, res) {
	var gameid = req.query.gameid;
	var player = req.query.player;
	var added = false;
	var word = req.query.word;
	var add = 0;
	var winner = false;
	var update = false
	table.find({'encasing.gameid': gameid}, function (err, docs) {
		if (err) {return 'error'}
		else {
			var combos = docs[0].encasing.combos;
			var index = combos.indexOf(word);
			if (index != -1){
				update = true
				add = 1;
				combos.splice(index, 1)
				if (combos.length == 0){
					winner = true;
				};
				table.findAndModify({"encasing.gameid" : gameid},
				{$set:{"encasing.combos" : combos}});
				res.json({'answer': 'Correct', 'winner' : winner});
			}
			else {
				res.json({'answer' : 'Wrong', 'winner': winner});
			};
		};
	});
	gamestate.find({'gamestate.gameid' : gameid}, function (err, docs) {
		if (err) {return 'error'}
		else {
			var scores = docs[0].gamestate.scores;
			var keys = Object.keys(scores);
			var guesses = docs[0].gamestate.guessed_answers;
			if (keys.length > 0) {
				for (i = 0; i < keys.length; i++){
					if (keys[i] == player) {
						added = true;
						scores[i] = parseInt(scores[i]) + add;
					};
				};
			};
			if (added == false) {
				scores[player] = add
			};
			if (update == true) {
				guesses.push(word);
			};
			gamestate.findAndModify({"gamestate.gameid" : gameid},{$set:{"gamestate.guessed_answers" : guesses}});			
			gamestate.findAndModify({"gamestate.gameid" : gameid},{$set:{"gamestate.scores" : scores}});
		};
	});
});

app.get('/updateFoundWords', function(req, res) {
	var gameid = req.query.gameid;
	gamestate.find({'gamestate.gameid' : gameid}, function (err, docs) {
		if (err) {return 'error'}
		else {
			res.json(docs[0].gamestate.guessed_answers);
		};
	});
});

app.get('/updateScores', function(req,res) {
	var gameid = req.query.gameid;
	gamestate.find({'gamestate.gameid' : gameid}, function (err, docs) {
		if (err) {return 'error'}
		else {
			var scores = docs[0].gamestate.scores;
			var keys = Object.keys(scores);
			var data = []
			for (i = 0; i<keys.length; i++){
				data.push(docs[0].gamestate.players[i] + ' - ' + scores[i] + '00 ');
			};
			res.json({'scores' : data});
		};
	});
});

app.get('/gameover', function(req, res) {
	var gameid = req.query.gameid;
	table.find({'encasing.gameid' : gameid}, function (err, docs) {
		if (err) {return 'error'}
		else {
			console.log(docs[0].encasing.combos)
			if (docs[0].encasing.combos.length == 0) {
				res.json({'gameover' : true});
			}
			else {
				res.json({'gameover' : false});
			};
		};
	});
});

