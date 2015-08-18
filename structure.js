var db = require('monk')('localhost/test');
var users = db.get('words');
var lineReader = require('line-reader');


/// Use this to seed Db //////
function seedDb(){
	var counter = 0
	lineReader.eachLine('dictionary.txt', function(line) {
		users.insert({ "word": line });
		console.log('Word ' + counter + ' added!');
		counter += 1;
	});
};

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
	var newCLass = this;
	var combos = [];
	lineReader.eachLine('dictionary.txt', function(line) {
		if (line.length > 3) {
		var a = newCLass.findWords(line);
			if (a != undefined){
				if (combos.indexOf(a) == -1){
					combos.push(a.toLowerCase());
				};
			};
		};	
	}).then(function() {
		callback (combos);
	});
};

Board.prototype.findWords = function(word) {
	var newCLass = this;
	for (var i = 0; i < newCLass.board.length; i ++) {
		for (var j = 0; j < newCLass.board[i].length; j++) {
			if (newCLass.board[i][j] == word[0].toUpperCase()) {
				if (j + word.length <= 15){
					if (newCLass.board[i].slice(j, (j + word.length)) == word.toUpperCase()) {
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

module.exports = {Board: Board, Players : Players, seedDb: seedDb}

