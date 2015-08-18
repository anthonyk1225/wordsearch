var structure = require('../structure');
var Board = structure.Board;
var Players = structure.Players;
var game = require('monk')('localhost/games');
var currentgames = game.get('currentgames');
var board = require('monk')('localhost/boards');
var table = board.get('tables');
var data = require('monk')('localhost/gamestate');
var gamestate = data.get('data');

module.exports = function(app) {
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


	//Determines whether to let the user play or watch
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


	// returns who the current player of the game is
	app.get('/findcurrentplayer/', function(req, res) {
		var gameid = req.query.gameid;
		gamestate.find({'gamestate.gameid' : gameid}, function (err, docs) {
			if (err) {return 'error'}
			else {
				res.json(docs[0].gamestate.current_player);
			};
		});
	});


	//changes the current player and returns the next player
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


	// returns the winner of the game
	app.get('/winner', function(req, res) {
		var gameid = req.query.gameid;
		var players = req.query.players;
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


	//takes a player's guess and updates in gamestate if a valid answer. Returns answer boolean value
	// and checks to see if game is over
	app.get('/scores/', function(req, res) {
		var gameid = req.query.gameid;
		var player = req.query.player;
		var added = false;
		var word = req.query.word.toLowerCase();
		var add = 0;
		var winner = false;
		var update = false;
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


	//will return all of the found words of the game
	app.get('/updateFoundWords', function(req, res) {
		var gameid = req.query.gameid;
		gamestate.find({'gamestate.gameid' : gameid}, function (err, docs) {
			if (err) {return 'error'}
			else {
				res.json(docs[0].gamestate.guessed_answers);
			};
		});
	});


	//will return the current scores of the game
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


	// will return true or false, determining if game is over
	app.get('/gameover', function(req, res) {
		var gameid = req.query.gameid;
		table.find({'encasing.gameid' : gameid}, function (err, docs) {
			if (err) {return 'error'}
			else {
				if (docs[0].encasing.combos.length == 0) {
					res.json({'gameover' : true});
				}
				else {
					res.json({'gameover' : false});
				};
			};
		});
	});
};